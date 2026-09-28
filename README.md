# RX Resolve

A solo-builder hackathon prototype for prescription refill exception resolution.

## What it demonstrates

- Refill Command Center: see what is stuck, why, who owns it, and what happens next.
- Intelligent Refill Case: structured evidence, blocker detection, recommended resolution.
- Human authorization boundary: AI prepares the workflow; an authorized provider makes the consequential clinical decision.
- Closed-loop workflow: prepare → provider review → action sent → verify → resolved.
- Audit-style timeline and explicit state transitions.
- Synthetic data only; no production healthcare integrations.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

Push the project to GitHub and import the repository into Vercel. This prototype has no required secrets or environment variables.

## Next production step

Swap the deterministic demo intelligence adapter for a real LLM-backed resolver and replace simulated external-system adapters with production integrations, while keeping the state engine and human authorization boundary intact.
