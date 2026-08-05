# AI Domain Index — Placify AI

## Purpose
Maps the documents that govern how an AI agent (or a human following the same discipline) should operate within this repository.

## Responsibilities
List and link the three operating documents: agent rules, prompting conventions, and standard task workflows.

## Scope
Covers agent-operating governance only. Does NOT cover the Gemini extraction integration itself — that's a product feature, documented in [`Backend/services.md`](../Backend/services.md), not an agent-operating concern.

## High-Level Overview
| Document | Concern |
|---|---|
| [`agents.md`](agents.md) | The operating contract every agent session follows |
| [`prompts.md`](prompts.md) | How to phrase requests to this repo for good results |
| [`workflows.md`](workflows.md) | Standard step sequences for common task shapes |

## Design Principles
1. **This domain makes the rest of the tree self-enforcing.** Every other domain's "documentation-first, no silent drift" principle only holds if an agent actually follows [`agents.md`](agents.md) — this domain exists specifically to make that non-optional.

## Workflow
N/A — this is a folder index, not a process document itself.

## Inputs
N/A.

## Outputs
N/A — this is a navigation document.

## Dependencies
- [`Agent.md`](../../Agent.md) — the root entry point this domain's rules are a detailed expansion of.

## Interactions with Other Services
N/A.

## Security Considerations
N/A at index level — see [`agents.md`](agents.md).

## Performance Considerations
N/A.

## Future Improvements
None currently identified.

## Notes for Developers
Read [`agents.md`](agents.md) in full before making any change to this repository, human or AI — it's short by design specifically so this is a low-cost habit to maintain.
