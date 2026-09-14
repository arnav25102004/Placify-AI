"""
Unified multi-provider LLM client.

Tries providers in priority order (env `LLM_PROVIDER_PRIORITY`, default
"gemini,nvidia,groq"). A provider is only attempted if its API key env var
is actually set to something real — placeholder/dev values are treated as
absent so we don't waste a call and log noise on every request. Returns
`None` (never raises) when every provider is unavailable or fails, so
callers can fall back to a deterministic mock — this client never hard-fails
the pipeline.
"""
import json
import os
from typing import Any, Dict, Iterator, Optional

from app.logging_config import get_logger
from app.services.rate_limiter import TokenBucketRateLimiter

logger = get_logger("placify.llm_client")

DEFAULT_PRIORITY = "gemini,nvidia,groq"

# Values that mean "no real key configured" even though the env var is set —
# e.g. docker-compose.yml's GEMINI_API_KEY default placeholder.
_PLACEHOLDER_VALUES = {"", "dev_key", "<GEMINI_API_KEY>", "<NVIDIA_API_KEY>", "<GROQ_API_KEY>"}

PROVIDER_CONFIG = {
    "nvidia": {
        "env_key": "NVIDIA_API_KEY",
        "base_url": "https://integrate.api.nvidia.com/v1",
        # Verify against NVIDIA NIM's current catalog before relying on this in production —
        # free-tier model availability rotates.
        "model": "meta/llama-3.1-70b-instruct",
    },
    "groq": {
        "env_key": "GROQ_API_KEY",
        "base_url": "https://api.groq.com/openai/v1",
        # Verify against Groq's current model list before relying on this in production.
        "model": "llama-3.3-70b-versatile",
    },
}


def _provider_priority() -> list:
    raw = os.getenv("LLM_PROVIDER_PRIORITY", DEFAULT_PRIORITY)
    return [p.strip() for p in raw.split(",") if p.strip()]


class LLMClient:
    def __init__(self):
        self._rate_limiters: Dict[str, TokenBucketRateLimiter] = {}

    def _rate_limiter(self, provider: str) -> TokenBucketRateLimiter:
        if provider not in self._rate_limiters:
            self._rate_limiters[provider] = TokenBucketRateLimiter(
                key=f"llm_rate_limiter_{provider}", capacity=30, refill_rate=0.5
            )
        return self._rate_limiters[provider]

    def _gemini_key(self) -> Optional[str]:
        key = os.getenv("GEMINI_API_KEY", "")
        return key if key not in _PLACEHOLDER_VALUES else None

    def _openai_compatible_key(self, provider: str) -> Optional[str]:
        cfg = PROVIDER_CONFIG[provider]
        key = os.getenv(cfg["env_key"], "")
        return key if key not in _PLACEHOLDER_VALUES else None

    def _call_gemini(self, prompt: str, system: Optional[str]) -> Optional[str]:
        api_key = self._gemini_key()
        if not api_key:
            return None
        try:
            from google import genai

            client = genai.Client(api_key=api_key)
            full_prompt = f"{system}\n\n{prompt}" if system else prompt
            response = client.models.generate_content(model="gemini-2.5-pro", contents=full_prompt)
            return response.text
        except Exception as e:
            logger.warning(f"Gemini text generation failed: {e}")
            return None

    def _call_openai_compatible(self, provider: str, prompt: str, system: Optional[str]) -> Optional[str]:
        api_key = self._openai_compatible_key(provider)
        if not api_key:
            return None
        cfg = PROVIDER_CONFIG[provider]
        try:
            from openai import OpenAI

            client = OpenAI(api_key=api_key, base_url=cfg["base_url"])
            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})
            response = client.chat.completions.create(model=cfg["model"], messages=messages)
            return response.choices[0].message.content
        except Exception as e:
            logger.warning(f"{provider} generation failed: {e}")
            return None

    def _stream_openai_compatible(self, provider: str, prompt: str, system: Optional[str]) -> Optional[Iterator[str]]:
        api_key = self._openai_compatible_key(provider)
        if not api_key:
            return None
        cfg = PROVIDER_CONFIG[provider]
        try:
            from openai import OpenAI

            client = OpenAI(api_key=api_key, base_url=cfg["base_url"])
            messages = []
            if system:
                messages.append({"role": "system", "content": system})
            messages.append({"role": "user", "content": prompt})
            stream = client.chat.completions.create(model=cfg["model"], messages=messages, stream=True)

            def _iter():
                for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices else None
                    if delta:
                        yield delta

            return _iter()
        except Exception as e:
            logger.warning(f"{provider} streaming failed: {e}")
            return None

    def generate(self, prompt: str, system: Optional[str] = None) -> Optional[str]:
        """Returns generated text from the first available/working provider, or None."""
        for provider in _provider_priority():
            if provider == "gemini":
                if not self._gemini_key():
                    continue
                text = self._call_gemini(prompt, system)
            elif provider in PROVIDER_CONFIG:
                if not self._openai_compatible_key(provider):
                    continue
                self._rate_limiter(provider).acquire(tokens=1, timeout=10.0)
                text = self._call_openai_compatible(provider, prompt, system)
            else:
                logger.warning(f"Unknown LLM provider '{provider}' in LLM_PROVIDER_PRIORITY, skipping.")
                continue

            if text:
                logger.info(f"LLM generation served by provider='{provider}'")
                return text

        logger.info("No LLM provider available/succeeded; caller should fall back to deterministic mock.")
        return None

    def generate_json(self, prompt: str, system: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Like generate(), but parses the response as JSON. Returns None on any failure."""
        text = self.generate(prompt, system)
        if text is None:
            return None
        try:
            clean = text.strip()
            if clean.startswith("```"):
                clean = clean.strip("`")
                if clean.lower().startswith("json"):
                    clean = clean[4:]
            return json.loads(clean.strip())
        except Exception as e:
            logger.warning(f"LLM response was not valid JSON: {e}")
            return None

    def generate_with_tools(
        self,
        prompt: str,
        tools: list,
        tool_executor,
        system: Optional[str] = None,
        max_turns: int = 3,
    ) -> Optional[str]:
        """
        Runs an OpenAI-compatible tool-calling loop: the LLM sees `tools` (JSON-schema
        function definitions) and can request calls; `tool_executor(name, args) -> Any`
        executes them and the result is fed back for the next turn. Returns the final
        text response, or None if no provider is configured or every attempt fails.

        Only the OpenAI-compatible providers (nvidia/groq) support this here — Gemini's
        tool-calling isn't wired into this client.
        """
        for provider in _provider_priority():
            if provider not in PROVIDER_CONFIG:
                continue
            api_key = self._openai_compatible_key(provider)
            if not api_key:
                continue
            cfg = PROVIDER_CONFIG[provider]
            try:
                from openai import OpenAI

                client = OpenAI(api_key=api_key, base_url=cfg["base_url"])
                messages = []
                if system:
                    messages.append({"role": "system", "content": system})
                messages.append({"role": "user", "content": prompt})

                self._rate_limiter(provider).acquire(tokens=1, timeout=10.0)

                final_text = None
                for _ in range(max_turns):
                    response = client.chat.completions.create(
                        model=cfg["model"], messages=messages, tools=tools, tool_choice="auto"
                    )
                    msg = response.choices[0].message
                    if not msg.tool_calls:
                        final_text = msg.content
                        break

                    messages.append(
                        {
                            "role": "assistant",
                            "content": msg.content,
                            "tool_calls": [tc.model_dump() for tc in msg.tool_calls],
                        }
                    )
                    for tc in msg.tool_calls:
                        try:
                            args = json.loads(tc.function.arguments or "{}")
                            result = tool_executor(tc.function.name, args)
                        except Exception as e:
                            result = {"error": str(e)}
                        messages.append(
                            {
                                "role": "tool",
                                "tool_call_id": tc.id,
                                "content": json.dumps(result),
                            }
                        )

                if final_text:
                    logger.info(f"LLM tool-calling loop served by provider='{provider}'")
                    return final_text
            except Exception as e:
                logger.warning(f"{provider} tool-calling failed: {e}")
                continue

        logger.info("No provider available/succeeded for tool-calling; caller should fall back.")
        return None

    def generate_stream(self, prompt: str, system: Optional[str] = None) -> Optional[Iterator[str]]:
        """
        Returns a generator of text chunks from the first available streaming-capable
        provider (Gemini's SDK path isn't wired for streaming here — only the
        OpenAI-compatible providers are), or None if none are configured.
        """
        for provider in _provider_priority():
            if provider not in PROVIDER_CONFIG:
                continue
            if not self._openai_compatible_key(provider):
                continue
            self._rate_limiter(provider).acquire(tokens=1, timeout=10.0)
            stream = self._stream_openai_compatible(provider, prompt, system)
            if stream is not None:
                logger.info(f"LLM streaming served by provider='{provider}'")
                return stream
        logger.info("No streaming-capable LLM provider available; caller should fall back.")
        return None


llm_client = LLMClient()
