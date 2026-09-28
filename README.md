# RelayOps

> AI-assisted refill operations orchestration for healthcare practices — turning stuck prescription refill requests into visible, accountable, closed-loop workflows.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)

**Live Demo:** https://relay-ops-steel.vercel.app

---

## Overview

RelayOps is a hackathon-built, B2B healthcare operations prototype focused on one operational problem: **what happens when a prescription refill gets stuck?**

In many refill workflows, the operational team needs to understand several things quickly:

- What is blocking the refill?
- Who currently owns the next action?
- How long has the case been waiting?
- What should happen next?
- Does the case actually reach a verified resolution?

RelayOps brings those answers into a single **Refill Command Center** and then opens an **Intelligent Refill Case** for deeper investigation and action.

The product combines structured case data, AI-assisted workflow reasoning, explicit human approval gates, an auditable state engine, and outcome verification.

> **Important:** RelayOps uses synthetic/demo data and simulated downstream workflows. It is a prototype, not a production clinical system.

---

## The Problem

A blocked refill can involve different operational failure points: incomplete information, insurance administration, provider review, or other unresolved exceptions.

The operational challenge is not only identifying the blocker. It is maintaining a reliable chain from:

**Blocker → Owner → Next Action → External Response → Verification → Resolution**

RelayOps is designed around that chain.

---

## What RelayOps Does

### 1. Refill Command Center

A centralized operational dashboard shows the refill exception queue and surfaces:

- Cases requiring attention
- Priority
- Blocker / reason the case is stuck
- Current owner
- Waiting time
- Next action
- Resolution status

The dashboard also provides high-level operational metrics for attention, provider review, verification, and resolved cases.

### 2. Intelligent Refill Case

Opening a refill creates a focused workspace containing:

- Patient context
- Pharmacy
- Provider
- Medication and dosage context
- Current blocker
- Owner
- Waiting time
- Next action
- Evidence
- Audit-style activity timeline

This keeps the operational context together instead of scattering it across disconnected messages or tasks.

### 3. AI Refill Resolver

RelayOps uses Gemini through the Google GenAI SDK to assist with workflow reasoning.

The resolver can:

- Summarize the operational blocker
- Explain why a conclusion was reached
- Surface supporting evidence
- Recommend the next workflow action
- Provide a confidence level
- Identify when human approval is required
- Provide a safety note for the workflow decision

The AI output is treated as **workflow assistance**, not as an autonomous clinical decision.

### 4. Human-in-the-Loop Control

RelayOps explicitly separates operational automation from consequential clinical authorization.

When a case requires provider involvement, the state machine routes it through a provider review gate rather than allowing the AI to act as the clinical decision-maker.

### 5. Closed-Loop Resolution State Engine

Each refill follows an explicit operational state sequence:

```text
BLOCKED
   ↓
ACTION READY
   ↓
PROVIDER REVIEW
   ↓
ACTION SENT
   ↓
VERIFY
   ↓
RESOLVED
```

The UI presents these states as a horizontal checkpoint timeline.

A case is **not considered resolved merely because an action was sent**. The workflow continues until the downstream result is verified.

### 6. Audit-Style Timeline

Each major workflow event is recorded in the case timeline, making the progression easier to understand and demonstrate.

Examples include:

- Refill request received
- Prescription matched
- Blocker identified
- AI analysis completed
- Resolution plan generated
- Provider review requested
- Operational action sent
- External response received
- Verification passed
- Case resolved

---

## Product Flow

A typical RelayOps journey looks like this:

```text
Refill enters queue
        ↓
Blocker identified
        ↓
AI analyzes the workflow
        ↓
Recommendation prepared
        ↓
Human approval gate when required
        ↓
Workflow action sent
        ↓
External response simulated
        ↓
Outcome verified
        ↓
Case marked RESOLVED
```

This is the central product idea: **make the operational handoff explicit and close the loop.**

---

## AI Safety Boundary

RelayOps is intentionally designed with a clear human-control boundary.

The AI can support tasks such as:

- Understanding the workflow context
- Identifying blockers
- Organizing evidence
- Preparing recommended workflow actions
- Detecting low-confidence situations

The AI does **not** independently authorize clinical decisions or prescribe medication changes.

When the available information is insufficient or a consequential decision requires a provider, the workflow is designed to stop or escalate rather than guess.

---

## Architecture

```text
┌──────────────────────────────────────────────┐
│                RelayOps UI                   │
│                                              │
│  Command Center → Refill Case → State Engine │
│             → Timeline / Human Gate          │
└──────────────────────┬───────────────────────┘
                       │
                       │ POST /api/resolve
                       ▼
┌──────────────────────────────────────────────┐
│       Next.js Server Route (API)             │
│                                              │
│  Validates input → builds workflow prompt    │
│  → calls Gemini → returns structured JSON    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Google Gemini API               │
│        Gemini 3.5 Flash-Lite model           │
└──────────────────────────────────────────────┘
```

The Gemini API key is kept server-side through an environment variable and is not intended to be committed to the repository.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.6 |
| UI | React 19.2.0 |
| Language | TypeScript 5.7.2 |
| AI | Google Gemini via `@google/genai` |
| AI Model | Gemini 3.5 Flash-Lite |
| Icons | Lucide React |
| Styling | Custom CSS |
| Deployment | Vercel |
| Source Control | Git + GitHub |

---

## Project Structure

```text
RelayOps/
├── app/
│   ├── api/
│   │   └── resolve/
│   │       └── route.ts        # Server-side Gemini workflow resolver
│   ├── globals.css              # Global application styling
│   └── page.tsx                 # Command center, case view and workflow state
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Kishngit25905/RelayOps.git
cd RelayOps
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the Gemini API key

Create a local environment file:

```text
.env.local
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key
```

> Never commit `.env.local` or expose the API key in client-side code.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Production Build

To validate the application before deployment:

```bash
npm run build
```

The current project builds successfully with Next.js production compilation and TypeScript validation.

---

## Deploying to Vercel

RelayOps is deployed as a Next.js application on Vercel.

For a new deployment:

1. Import the GitHub repository into Vercel.
2. Select **Next.js** as the framework when prompted.
3. Add the environment variable:

```text
GEMINI_API_KEY
```

4. Deploy.

The application can then call the server-side `/api/resolve` route without exposing the API key to the browser.

---

## Demo Walkthrough

For a short product demo, use this sequence:

```text
1. Open the Refill Command Center
2. Show the Refills Requiring Attention table
3. Open a refill case
4. Show blocker + owner + next action
5. Run AI Refill Resolver
6. Show AI evidence + recommendation + confidence
7. Show the Resolution State Engine
8. Move through Provider Review / Action Sent / Verify
9. Verify the result
10. Finish on RESOLVED and return to the dashboard
```

---

## Why This Product Is Interesting

RelayOps is not positioned as "AI that prescribes."

The product idea is to use AI where it is useful in an operational process — **understanding context, preparing actions, organizing evidence, and handling uncertainty — while preserving an explicit human gate around consequential clinical decisions.**

That creates a workflow that is:

- **Visible** — the blocker, owner and next action are explicit.
- **Actionable** — the system prepares the next operational step.
- **Controlled** — human authorization remains visible in the workflow.
- **Auditable** — state transitions and events are recorded.
- **Closed-loop** — resolution requires verification.

---

## Current Prototype Boundaries

This hackathon version intentionally uses:

- Synthetic patient and prescription information
- Simulated pharmacy / provider / payer interactions
- In-memory demo state
- Demo workflow transitions
- A server-side Gemini API integration

It does not claim production readiness, clinical validation, or integration with real healthcare systems.

---

## Future Roadmap

Potential next steps for a production-oriented version include:

### Workflow Infrastructure

- Persistent database-backed case state
- Role-based access control
- Multi-user practice workspaces
- Configurable workflow policies
- Queue assignment and SLA management

### Healthcare Integrations

- Pharmacy system adapters
- Practice-management / EHR integrations
- Payer workflow adapters
- Secure event webhooks
- Production audit logging

### AI Improvements

- Retrieval over practice-specific workflow policies
- Confidence calibration and evaluation datasets
- Better exception classification
- Human feedback loops
- Observability for AI decisions and failures

### Product Analytics

- Time-to-resolution metrics
- Exception volume trends
- Bottleneck analysis
- Owner workload visibility
- Operational outcome reporting

---

## Disclaimer

RelayOps is a hackathon prototype for demonstrating workflow orchestration and AI-assisted operations.

All data shown in the demo is synthetic. The application is not a medical device, does not provide medical advice, and does not replace qualified clinical professionals or validated production healthcare software.

---

## Author

**Kishan G**

GitHub: https://github.com/Kishngit25905

Project: https://github.com/Kishngit25905/RelayOps

Live Demo: https://relay-ops-steel.vercel.app

---

## License

No open-source license is currently declared for this repository. Unless a license is added, the repository should be treated as **all rights reserved** by the author.
