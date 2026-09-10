import os
import time
import redis
from typing import Optional

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class TokenBucketRateLimiter:
    """
    Redis-backed token bucket rate limiter for external APIs (e.g. Gemini).
    Falls back to synchronous pass-through if Redis is unavailable.
    """
    def __init__(self, key: str = "gemini_rate_limiter", capacity: int = 60, refill_rate: float = 1.0):
        self.key = key
        self.capacity = capacity
        self.refill_rate = refill_rate  # tokens per second
        self.redis_client: Optional[redis.Redis] = None
        try:
            client = redis.Redis.from_url(REDIS_URL, socket_timeout=1.0)
            client.ping()
            self.redis_client = client
        except Exception:
            self.redis_client = None

    def acquire(self, tokens: int = 1, timeout: float = 10.0) -> bool:
        if not self.redis_client:
            # Fallback if Redis is not running in dev environment
            return True

        start = time.time()
        while time.time() - start < timeout:
            now = time.time()
            pipe = self.redis_client.pipeline()
            pipe.get(f"{self.key}:tokens")
            pipe.get(f"{self.key}:last_updated")
            results = pipe.execute()

            raw_tokens, raw_last = results[0], results[1]
            current_tokens = float(raw_tokens) if raw_tokens else float(self.capacity)
            last_updated = float(raw_last) if raw_last else now

            elapsed = now - last_updated
            refilled = min(float(self.capacity), current_tokens + (elapsed * self.refill_rate))

            if refilled >= tokens:
                new_tokens = refilled - tokens
                pipe = self.redis_client.pipeline()
                pipe.set(f"{self.key}:tokens", str(new_tokens))
                pipe.set(f"{self.key}:last_updated", str(now))
                pipe.execute()
                return True

            time.sleep(0.1)

        return False
