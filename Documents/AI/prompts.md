# Prompting Conventions — Placify AI

## Purpose
Defines how a human should phrase a request to this repository's agent to get accurate, well-scoped results — reducing the chance of an agent guessing wrong on domain or intent.

## Responsibilities
Give concrete phrasing guidance specific to this repo's structure (domains, phased build, documentation-first discipline).

## Scope
Covers request phrasing conventions only. Does NOT cover what the agent does once a request is understood (see [`agents.md`](agents.md)) or task-type workflows (see [`workflows.md`](workflows.md)).

## High-Level Overview
- **Name the domain up front** when it's known — "in the Backend queue logic, ..." resolves ambiguity faster than a domain-less request the agent has to infer.
- **Say explicitly if you want a design review vs. an implementation.** Per [`agents.md`](agents.md) Rule 2, documents are treated as normative by default — if you want the agent to challenge or reconsider an existing document rather than build to it, say so directly ("review whether this approach is still right" vs. "implement this").
- **Flag when a request is Teacher-Portal-only vs. cross-portal.** Since only the Teacher Portal domain exists in this tree currently (see [`Agent.md`](../../Agent.md)), a request that seems to assume PR or Student Portal behavior should note that explicitly, so the agent doesn't invent undesigned architecture to satisfy it.
- **Reference an ADR number directly** when a request relates to a past decision ("per ADR-004, ...") rather than re-describing the reasoning — keeps requests short and unambiguous.

## Design Principles
1. **Specificity over brevity when they trade off.** A slightly longer request that names the domain and intent produces a faster, more correct response than a short, ambiguous one the agent has to interpret.

## Workflow
N/A — this is a phrasing-convention reference, not a process document.

## Inputs
N/A.

## Outputs
N/A.

## Dependencies
- [`AI/agents.md`](agents.md) — the operating rules these conventions help an agent apply correctly.

## Interactions with Other Services
N/A.

## Security Considerations
N/A.

## Performance Considerations
N/A.

## Future Improvements
Add PR Portal / Student Portal-specific phrasing guidance once those domains exist in this tree.

## Notes for Developers
If you notice an agent repeatedly misinterpreting a certain phrasing of request, that's a signal to add a convention here — this document should grow from real friction, not be front-loaded with hypothetical guidance.
