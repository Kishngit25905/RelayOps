"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Fragment } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
  Zap,
  AlertTriangle,
  BrainCircuit,
  CircleCheck,
  CircleAlert,
  Activity,
  Target,
} from "lucide-react";

type State =
  | "BLOCKED"
  | "ACTION_READY"
  | "AWAITING_PROVIDER_REVIEW"
  | "ACTION_SENT"
  | "VERIFYING"
  | "RESOLVED";

type Blocker =
  | "NO_REFILLS_REMAINING"
  | "MISSING_INFORMATION"
  | "INSURANCE_ADMIN_BLOCK"
  | "PHARMACY_CLARIFICATION"
  | "UNKNOWN_EXCEPTION";

type CaseItem = {
  id: string;
  caseNumber: string;
  patient: string;
  medication: string;
  dosage: string;
  pharmacy: string;
  provider: string;
  blocker: Blocker;
  state: State;
  owner: string;
  priority: "HIGH" | "MEDIUM";
  nextAction: string;
  waiting: string;
  aiConfidence: "HIGH" | "MEDIUM" | "LOW";
  aiSummary: string;
  recommendation: string;
  aiSafetyNote?: string;
  evidence: string[];
  timeline: {
    title: string;
    description: string;
    time: string;
  }[];
  approvalRequired: boolean;
  providerDecision?: "APPROVED" | "DECLINED" | "MORE_INFO";
  escalated?: boolean;
};

const initialCases: CaseItem[] = [
  {
    id: "RX-10482",
    caseNumber: "RX-10482",
    patient: "Patient #10482",
    medication: "ExampleMed XR",
    dosage: "10 mg · once daily",
    pharmacy: "HealthPlus Pharmacy",
    provider: "Dr. Ananya Rao",
    blocker: "NO_REFILLS_REMAINING",
    state: "BLOCKED",
    owner: "Authorized Provider",
    priority: "HIGH",
    nextAction: "Analyze and prepare provider review",
    waiting: "3h 18m",
    aiConfidence: "HIGH",
    aiSummary:
      "The active prescription has zero remaining refills. The request cannot proceed without authorized provider review.",
    recommendation:
      "Prepare the provider review packet, require provider authentication, then continue only after an authorized decision.",
    aiSafetyNote:
      "AI is assisting the operational workflow only. It does not prescribe, authorize or change medication.",
    evidence: [
      "Prescription matched to refill request",
      "Remaining refills = 0",
      "Provider identity linked to prescription",
      "No clinical decision has been made by AI",
    ],
    timeline: [
      {
        title: "Refill request received",
        description:
          "HealthPlus Pharmacy submitted a refill request.",
        time: "09:14",
      },
      {
        title: "Prescription matched",
        description:
          "Existing prescription and pharmacy request were matched.",
        time: "09:15",
      },
      {
        title: "Blocker identified",
        description:
          "System detected zero remaining refills.",
        time: "09:15",
      },
    ],
    approvalRequired: true,
  },

  {
    id: "RX-10517",
    caseNumber: "RX-10517",
    patient: "Patient #10517",
    medication: "ExampleMed Plus",
    dosage: "20 mg · twice daily",
    pharmacy: "HealthPlus Pharmacy",
    provider: "Dr. Ananya Rao",
    blocker: "MISSING_INFORMATION",
    state: "BLOCKED",
    owner: "Practice Staff",
    priority: "MEDIUM",
    nextAction: "Analyze missing information",
    waiting: "1h 42m",
    aiConfidence: "MEDIUM",
    aiSummary:
      "The refill request is missing a required administrative detail. The system can route the clarification without making a clinical decision.",
    recommendation:
      "Send a clarification request and re-run case analysis when the missing field is supplied.",
    aiSafetyNote:
      "This path is administrative and does not require an AI clinical decision.",
    evidence: [
      "Refill request received",
      "Prescription remains active",
      "Required request field is incomplete",
    ],
    timeline: [
      {
        title: "Refill request received",
        description:
          "Request entered the practice workflow.",
        time: "10:41",
      },
      {
        title: "Information gap detected",
        description:
          "One required request field is incomplete.",
        time: "10:42",
      },
    ],
    approvalRequired: false,
  },

  {
    id: "RX-10531",
    caseNumber: "RX-10531",
    patient: "Patient #10531",
    medication: "ExampleMed XR",
    dosage: "10 mg · once daily",
    pharmacy: "HealthPlus Pharmacy",
    provider: "Dr. Ananya Rao",
    blocker: "INSURANCE_ADMIN_BLOCK",
    state: "BLOCKED",
    owner: "Practice Staff",
    priority: "HIGH",
    nextAction: "Analyze insurance workflow",
    waiting: "5h 11m",
    aiConfidence: "HIGH",
    aiSummary:
      "An administrative coverage requirement is preventing fulfillment. The next step is an insurance workflow, not a prescribing decision.",
    recommendation:
      "Start the insurance workflow and track the payer response to closure.",
    aiSafetyNote:
      "The AI is coordinating an administrative workflow and does not make a clinical decision.",
    evidence: [
      "Prescription remains active",
      "Coverage requirement detected",
      "Provider decision not currently required",
    ],
    timeline: [
      {
        title: "Refill request received",
        description:
          "Request entered the operational queue.",
        time: "06:58",
      },
      {
        title: "Coverage blocker detected",
        description:
          "Insurance workflow required.",
        time: "06:59",
      },
    ],
    approvalRequired: false,
  },

  {
    id: "RX-10620",
    caseNumber: "RX-10620",
    patient: "Patient #10620",
    medication: "ExampleMed",
    dosage: "Information incomplete",
    pharmacy: "HealthPlus Pharmacy",
    provider: "Dr. Ananya Rao",
    blocker: "UNKNOWN_EXCEPTION",
    state: "BLOCKED",
    owner: "Human Escalation",
    priority: "HIGH",
    nextAction: "Analyze conflicting information",
    waiting: "48m",
    aiConfidence: "LOW",
    aiSummary:
      "The case contains conflicting or insufficient information. The system should not confidently automate the next action.",
    recommendation:
      "Escalate to a human reviewer rather than attempting an uncertain automated action.",
    aiSafetyNote:
      "The system intentionally stops automation when the available evidence is insufficient.",
    evidence: [
      "Request contains conflicting information",
      "Required context is incomplete",
      "Automated resolution confidence is low",
    ],
    timeline: [
      {
        title: "Refill request received",
        description:
          "Request entered the operational queue.",
        time: "11:32",
      },
      {
        title: "Conflicting information detected",
        description:
          "System detected an unresolved information conflict.",
        time: "11:33",
      },
    ],
    approvalRequired: false,
    escalated: false,
  },
];

const flowSteps = [
  "BLOCKED",
  "ACTION READY",
  "PROVIDER REVIEW",
  "ACTION SENT",
  "VERIFY",
  "RESOLVED",
];

export default function Home() {
  const [cases, setCases] =
    useState<CaseItem[]>(initialCases);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [filter, setFilter] = useState<
    "ALL" | "HIGH" | "PROVIDER" | "INSURANCE"
  >("ALL");

  const [notice, setNotice] =
    useState<string | null>(null);

  const [aiLoading, setAiLoading] =
    useState(false);

  const selected =
    cases.find((item) => item.id === selectedId) ??
    null;

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      if (filter === "HIGH")
        return item.priority === "HIGH";

      if (filter === "PROVIDER")
        return item.owner === "Authorized Provider";

      if (filter === "INSURANCE")
        return item.blocker === "INSURANCE_ADMIN_BLOCK";

      return true;
    });
  }, [cases, filter]);

  const metrics = useMemo(() => {
    const active = cases.filter(
      (item) => item.state !== "RESOLVED"
    );

    const resolved = cases.filter(
      (item) => item.state === "RESOLVED"
    );

    const providerReviews = active.filter(
      (item) =>
        item.owner === "Authorized Provider"
    );

    const highPriority = active.filter(
      (item) => item.priority === "HIGH"
    );

    const verification = cases.filter(
      (item) => item.state === "VERIFYING"
    );

    const escalated = cases.filter(
      (item) => item.escalated
    );

    const auditCovered = cases.filter(
      (item) => item.timeline.length > 0
    );

    const contextVisible = cases.filter(
      (item) =>
        Boolean(item.owner) &&
        Boolean(item.nextAction) &&
        Boolean(item.aiSummary)
    );

    return {
      attention: active.length,
      provider: providerReviews.length,
      high: highPriority.length,
      verification: verification.length,
      resolved: resolved.length,
      escalated: escalated.length,

      resolutionRate:
        cases.length === 0
          ? 0
          : Math.round(
              (resolved.length / cases.length) *
                100
            ),

      auditCoverage:
        cases.length === 0
          ? 0
          : Math.round(
              (auditCovered.length / cases.length) *
                100
            ),

      contextCoverage:
        cases.length === 0
          ? 0
          : Math.round(
              (contextVisible.length /
                cases.length) *
                100
            ),
    };
  }, [cases]);

  function showNotice(message: string) {
    setNotice(message);

    window.setTimeout(() => {
      setNotice(null);
    }, 3500);
  }

  function openCase(id: string) {
    setSelectedId(id);
    setNotice(null);
  }

  function updateCase(
    id: string,
    updater: (current: CaseItem) => CaseItem,
    message: string
  ) {
    setCases((prev) =>
      prev.map((item) =>
        item.id === id
          ? updater(item)
          : item
      )
    );

    showNotice(message);
  }

  async function resolveWithAI(
    item: CaseItem
  ) {
    try {
      setAiLoading(true);

      const maxAttempts = 3;
      let response: Response | null = null;
      let result: any = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        response = await fetch(
          "/api/resolve",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              caseNumber: item.caseNumber,
              patient: item.patient,
              medication: item.medication,
              dosage: item.dosage,
              pharmacy: item.pharmacy,
              provider: item.provider,
              blocker: item.blocker,
              state: item.state,
              owner: item.owner,
              priority: item.priority,
              nextAction: item.nextAction,
              summary: item.aiSummary,
              evidence: item.evidence,
              approvalRequired:
                item.approvalRequired,
            }),
          }
        );

        result = await response.json();

        if (response.ok) {
          break;
        }

        if (response.status === 429) {
          throw new Error(
            result?.error ||
              "Gemini quota is exhausted. Please wait for the quota reset or use another model/project."
          );
        }

        const retryable =
          response.status === 408 ||
          response.status === 500 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504;

        if (!retryable || attempt === maxAttempts) {
          throw new Error(
            result?.error ||
              "AI request failed"
          );
        }

        const delay =
          Math.pow(2, attempt - 1) * 1000;

        await new Promise((resolve) =>
          window.setTimeout(resolve, delay)
        );
      }

      if (!response || !response.ok) {
        throw new Error(
          result?.error ||
            "AI request failed"
        );
      }

      const lowConfidence =
        result.confidence === "LOW" ||
        item.blocker ===
          "UNKNOWN_EXCEPTION";

      const requiresHuman =
        item.approvalRequired ||
        result.humanApprovalRequired === true;

      updateCase(
        item.id,
        (current) => {
          if (lowConfidence) {
            return {
              ...current,

              aiSummary:
                result.summary ??
                current.aiSummary,

              recommendation:
                result.recommendedAction ??
                current.recommendation,

              aiSafetyNote:
                result.safetyNote ??
                current.aiSafetyNote,

              nextAction:
                "Escalate to human review",

              owner:
                "Human Escalation",

              aiConfidence: "LOW",

              state: "BLOCKED",

              escalated: false,

              timeline: [
                ...current.timeline,

                {
                  title:
                    "Live AI analysis completed",
                  description:
                    result.summary ??
                    "AI analyzed the case.",
                  time: nowTime(),
                },

                {
                  title:
                    "AI stopped automation",
                  description:
                    "Confidence was too low for safe automated workflow action.",
                  time: nowTime(),
                },
              ],
            };
          }

          return {
            ...current,

            aiSummary:
              result.summary ??
              current.aiSummary,

            recommendation:
              result.recommendedAction ??
              current.recommendation,

            aiSafetyNote:
              result.safetyNote ??
              current.aiSafetyNote,

            nextAction: requiresHuman
              ? "Proceed to provider review"
              : "Proceed to operational action",

            aiConfidence:
              result.confidence ??
              current.aiConfidence,

            approvalRequired:
              requiresHuman,

            state: "ACTION_READY",

            owner: requiresHuman
              ? "Authorized Provider"
              : "System Orchestrator",

            timeline: [
              ...current.timeline,

              {
                title:
                  "Live AI analysis completed",
                description:
                  result.summary ??
                  "Gemini analyzed the refill workflow.",
                time: nowTime(),
              },

              {
                title:
                  "Resolution plan generated",
                description:
                  requiresHuman
                    ? "Provider authorization is required before the workflow can continue."
                    : "Operational action can proceed without clinical authorization.",
                time: nowTime(),
              },
            ],
          };
        },
        lowConfidence
          ? "AI stopped automation. Human review required."
          : "AI analysis complete. Resolution plan ready."
      );
    } catch (error) {
      console.error(
        "AI resolver error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "AI analysis failed.";

      showNotice(message);
    } finally {
      setAiLoading(false);
    }
  }

  function proceedFromAI(
    item: CaseItem
  ) {
    updateCase(
      item.id,
      (current) => ({
        ...current,

        state:
          current.approvalRequired
            ? "AWAITING_PROVIDER_REVIEW"
            : "ACTION_SENT",

        nextAction:
          current.approvalRequired
            ? "Provider authentication required"
            : "Awaiting external response",

        owner:
          current.approvalRequired
            ? "Authorized Provider"
            : "System Orchestrator",

        timeline: [
          ...current.timeline,

          {
            title:
              current.approvalRequired
                ? "Provider review requested"
                : "Operational action sent",

            description:
              current.approvalRequired
                ? "AI recommendation accepted. Provider authorization gate opened."
                : "AI recommendation accepted. Operational workflow action initiated.",

            time: nowTime(),
          },
        ],
      }),
      item.approvalRequired
        ? "Provider review gate opened."
        : "Operational action initiated."
    );
  }

  function escalateCase(
    item: CaseItem
  ) {
    updateCase(
      item.id,
      (current) => ({
        ...current,

        escalated: true,

        owner:
          "Human Escalation",

        nextAction:
          "Human reviewer assessment",

        timeline: [
          ...current.timeline,

          {
            title:
              "Case escalated",
            description:
              "A human reviewer is required because the system could not safely determine the next action.",
            time: nowTime(),
          },
        ],
      }),
      "Case escalated to human review."
    );
  }

  function providerApprove(
    item: CaseItem
  ) {
    updateCase(
      item.id,
      (current) => ({
        ...current,

        state: "ACTION_SENT",

        providerDecision:
          "APPROVED",

        owner:
          "System Orchestrator",

        nextAction:
          "Receive external response",

        timeline: [
          ...current.timeline,

          {
            title:
              "Provider authenticated",
            description:
              "Authorized provider identity confirmed in demo mode.",
            time: nowTime(),
          },

          {
            title:
              "Provider approved",
            description:
              "Authorized provider approved the proposed workflow action.",
            time: nowTime(),
          },

          {
            title:
              "Action sent",
            description:
              "Workflow action was initiated and is awaiting a response.",
            time: nowTime(),
          },
        ],
      }),
      "Provider approval recorded. Action sent."
    );
  }

  function providerDecline(
    item: CaseItem
  ) {
    updateCase(
      item.id,
      (current) => ({
        ...current,

        state: "BLOCKED",

        providerDecision:
          "DECLINED",

        owner:
          "Practice Staff",

        nextAction:
          "Review provider decision",

        timeline: [
          ...current.timeline,

          {
            title:
              "Provider authenticated",
            description:
              "Authorized provider identity confirmed in demo mode.",
            time: nowTime(),
          },

          {
            title:
              "Provider declined",
            description:
              "The workflow cannot proceed on the current authorization decision.",
            time: nowTime(),
          },
        ],
      }),
      "Provider declined. Case returned to blocked state."
    );
  }

  function providerMoreInfo(
    item: CaseItem
  ) {
    updateCase(
      item.id,
      (current) => ({
        ...current,

        state: "BLOCKED",

        providerDecision:
          "MORE_INFO",

        owner:
          "Practice Staff",

        nextAction:
          "Collect additional information",

        timeline: [
          ...current.timeline,

          {
            title:
              "Provider authenticated",
            description:
              "Authorized provider identity confirmed in demo mode.",
            time: nowTime(),
          },

          {
            title:
              "More information requested",
            description:
              "Provider requested additional information before making a decision.",
            time: nowTime(),
          },
        ],
      }),
      "Provider requested more information."
    );
  }

  function simulateResponse(
    item: CaseItem
  ) {
    updateCase(
      item.id,
      (current) => ({
        ...current,

        state: "VERIFYING",

        nextAction:
          "Verify external response",

        owner:
          "System Orchestrator",

        timeline: [
          ...current.timeline,

          {
            title:
              "External response received",
            description:
              "The simulated downstream system returned a response for this workflow action.",
            time: nowTime(),
          },
        ],
      }),
      "External response received. Verify the result."
    );
  }

  function verify(item: CaseItem) {
    updateCase(
      item.id,
      (current) => ({
        ...current,

        state: "RESOLVED",

        owner: "—",

        nextAction:
          "Resolved",

        timeline: [
          ...current.timeline,

          {
            title:
              "Verification passed",
            description:
              "Case ID, workflow response and expected outcome were verified.",
            time: nowTime(),
          },

          {
            title:
              "Case resolved",
            description:
              "Refill workflow reached a verified terminal state.",
            time: nowTime(),
          },
        ],
      }),
      "Verification passed. Case resolved."
    );
  }

  function resetDemo() {
    setCases(initialCases);
    setSelectedId(null);
    setNotice("Demo state reset.");
  }

  if (selected) {
    const isLowConfidence =
      selected.aiConfidence === "LOW";

    return (
      <div className="app-shell">
        <TopBar />

        <main className="page">
          <button
            className="back"
            onClick={() =>
              setSelectedId(null)
            }
          >
            <ArrowLeft size={15} />
            Back to Command Center
          </button>

          <div className="hero">
            <div>
              <div className="eyebrow">
                REFILL CASE
              </div>

              <h1 className="big-title">
                {selected.caseNumber}
              </h1>

              <p>
                Closed-loop resolution
                workspace for a stuck refill.
              </p>
            </div>

            <span
              className={statePill(
                selected.state
              )}
            >
              {prettyState(
                selected.state
              )}
            </span>
          </div>

          <div
            className="info-grid"
            style={{
              marginBottom: 16,
            }}
          >
            <Info
              label="PATIENT"
              value={selected.patient}
            />

            <Info
              label="PHARMACY"
              value={selected.pharmacy}
            />

            <Info
              label="PROVIDER"
              value={selected.provider}
            />
          </div>

          <div className="case-grid">
            <div className="case-main">
              <section className="card panel">
                <div className="section-head">
                  <h2>
                    Why is this refill
                    stuck?
                  </h2>

                  <span
                    className={priorityPill(
                      selected.priority
                    )}
                  >
                    {selected.priority} PRIORITY
                  </span>
                </div>

                <div className="callout">
                  <div className="eyebrow">
                    BLOCKER
                  </div>

                  <h4>
                    {prettyBlocker(
                      selected.blocker
                    )}
                  </h4>

                  <p>
                    {selected.aiSummary}
                  </p>
                </div>

                <div className="info-grid">
                  <Info
                    label="OWNER"
                    value={selected.owner}
                  />

                  <Info
                    label="WAITING"
                    value={selected.waiting}
                  />

                  <Info
                    label="NEXT ACTION"
                    value={selected.nextAction}
                  />
                </div>
              </section>

              <section className="card panel">
                <div className="section-head">
                  <div>
                    <h2>
                      Resolution State
                      Engine
                    </h2>

                    <span className="small-muted">
                      Every transition is
                      explicit and auditable
                    </span>
                  </div>

                  <BrainCircuit
                    size={20}
                    color="var(--cyan)"
                  />
                </div>

                <div className="checkpoint-track">
                  {flowSteps.map((step, idx) => {
                    const currentIdx = stateIndex(
                      selected.state
                    );

                    const done = currentIdx > idx;
                    const active = currentIdx === idx;

                    return (
                      <Fragment key={step}>
                        <div
                          className={`checkpoint ${
                            done ? "done" : ""
                          } ${active ? "active" : ""}`}
                        >
                          <div className="checkpoint-node">
                            {done ? (
                              <span className="checkpoint-check">
                                ✓
                              </span>
                            ) : active ? (
                              <span className="checkpoint-active-dot" />
                            ) : (
                              <span className="checkpoint-empty-dot" />
                            )}
                          </div>

                          <div className="checkpoint-number">
                            {String(idx + 1).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div className="checkpoint-label">
                            {step}
                          </div>
                        </div>

                        {idx < flowSteps.length - 1 && (
                          <div
                            className={`checkpoint-connector ${
                              currentIdx > idx ? "done" : ""
                            }`}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </section>

              <section className="card panel">
                <div className="section-head">
                  <h2>
                    Prescription
                    Context
                  </h2>

                  <VerifiedPill />
                </div>

                <div className="info-grid two">
                  <Info
                    label="MEDICATION"
                    value={
                      selected.medication
                    }
                  />

                  <Info
                    label="DOSAGE / SIG"
                    value={
                      selected.dosage
                    }
                  />

                  <Info
                    label="CLINICAL DECISION"
                    value={
                      selected.approvalRequired
                        ? "Provider controlled"
                        : "Not required for this path"
                    }
                  />

                  <Info
                    label="DATA CLASS"
                    value="Synthetic / demo"
                  />
                </div>
              </section>

              <section className="card panel">
                <div className="section-head">
                  <h2>
                    Activity Timeline
                  </h2>

                  <span className="small-muted">
                    Audit-style event history
                  </span>
                </div>

                <div className="timeline">
                  {selected.timeline.map(
                    (event, index) => (
                      <div
                        className="timeline-item"
                        key={`${event.time}-${index}`}
                      >
                        <div className="dot" />

                        <div>
                          <div className="timeline-title">
                            {event.title}
                          </div>

                          <div className="timeline-desc">
                            {
                              event.description
                            }
                          </div>

                          <div className="timeline-time">
                            {event.time}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>

            <div className="case-side">
              <section className="card panel ai-panel">
                <div className="ai-header">
                  <div>
                    <h3>
                      AI Refill Resolver
                    </h3>

                    <span className="small-muted">
                      Workflow intelligence
                    </span>
                  </div>

                  <span className="ai-chip">
                    <BrainCircuit
                      size={13}
                    />
                    GEMINI
                  </span>
                </div>

                <div className="ai-section">
                  <div className="k">
                    SYSTEM UNDERSTANDING
                  </div>

                  <p>
                    {
                      selected.aiSummary
                    }
                  </p>
                </div>

                <div className="ai-section">
                  <div className="k">
                    WHY THIS CONCLUSION
                  </div>

                  <div className="evidence-list">
                    {selected.evidence.map(
                      (e) => (
                        <div
                          className="evidence"
                          key={e}
                        >
                          <CircleCheck
                            size={14}
                          />
                          {e}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="ai-section">
                  <div className="k">
                    RECOMMENDED RESOLUTION
                  </div>

                  <p>
                    {
                      selected.recommendation
                    }
                  </p>
                </div>

                <div className="info-grid two">
                  <Info
                    label="CONFIDENCE"
                    value={
                      selected.aiConfidence
                    }
                  />

                  <Info
                    label="HUMAN CONTROL"
                    value={
                      selected.approvalRequired
                        ? "REQUIRED"
                        : "NOT REQUIRED"
                    }
                  />
                </div>

                {selected.aiSafetyNote && (
                  <div
                    className="callout"
                    style={{
                      marginTop: 12,
                    }}
                  >
                    <div className="k">
                      SAFETY NOTE
                    </div>

                    <p>
                      {
                        selected.aiSafetyNote
                      }
                    </p>
                  </div>
                )}

                {selected.state ===
                  "BLOCKED" &&
                  !selected.escalated && (
                    <button
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        marginTop: 14,
                      }}
                      onClick={() =>
                        resolveWithAI(
                          selected
                        )
                      }
                      disabled={
                        aiLoading
                      }
                    >
                      <Sparkles
                        size={16}
                      />

                      {aiLoading
                        ? "AI Analyzing..."
                        : "Analyze with AI"}
                    </button>
                  )}

                {selected.state ===
                  "ACTION_READY" && (
                  <div
                    className="callout"
                    style={{
                      marginTop: 14,
                    }}
                  >
                    <div className="eyebrow">
                      AI PLAN READY
                    </div>

                    <h4>
                      {
                        selected.approvalRequired
                          ? "Provider authorization required"
                          : "Operational action ready"
                      }
                    </h4>

                    <p>
                      {
                        selected.recommendation
                      }
                    </p>

                    <button
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        marginTop: 12,
                      }}
                      onClick={() =>
                        proceedFromAI(
                          selected
                        )
                      }
                    >
                      {selected.approvalRequired ? (
                        <>
                          <UserCheck
                            size={16}
                          />
                          Proceed to Provider
                          Review
                        </>
                      ) : (
                        <>
                          <ArrowRight
                            size={16}
                          />
                          Proceed to Operational
                          Action
                        </>
                      )}
                    </button>
                  </div>
                )}

                {selected.state ===
                  "RESOLVED" && (
                  <div className="callout green">
                    <h4>
                      <CheckCircle2
                        size={16}
                      />
                      Resolved
                    </h4>

                    <p>
                      Verified terminal state
                      reached. The complete
                      resolution history is
                      preserved in the timeline.
                    </p>
                  </div>
                )}
              </section>

              {isLowConfidence &&
                selected.state ===
                  "BLOCKED" && (
                  <section className="card panel">
                    <div className="callout red">
                      <h4>
                        <AlertTriangle
                          size={16}
                        />
                        AI stopped
                        automation
                      </h4>

                      <p>
                        The available
                        evidence is not
                        sufficient for a
                        confident automated
                        resolution.
                      </p>

                      <button
                        className="btn btn-red"
                        style={{
                          width: "100%",
                          marginTop: 12,
                        }}
                        onClick={() =>
                          escalateCase(
                            selected
                          )
                        }
                      >
                        Escalate to Human Review
                      </button>
                    </div>
                  </section>
                )}

              {selected.approvalRequired &&
                selected.state ===
                  "AWAITING_PROVIDER_REVIEW" && (
                  <ProviderGate
                    item={selected}
                    approve={() =>
                      providerApprove(
                        selected
                      )
                    }
                    decline={() =>
                      providerDecline(
                        selected
                      )
                    }
                    moreInfo={() =>
                      providerMoreInfo(
                        selected
                      )
                    }
                  />
                )}

              {selected.state ===
                "ACTION_SENT" && (
                <section className="card panel">
                  <div className="eyebrow">
                    EXTERNAL WORKFLOW
                  </div>

                  <h3
                    style={{
                      marginTop: 6,
                    }}
                  >
                    Waiting for response
                  </h3>

                  <p
                    className="small-muted"
                    style={{
                      marginTop: 8,
                    }}
                  >
                    A workflow action has
                    been sent. The case cannot
                    be marked resolved merely
                    because the action was sent.
                  </p>

                  <div
                    className="callout"
                    style={{
                      marginTop: 14,
                    }}
                  >
                    <div className="k">
                      EXPECTED NEXT EVENT
                    </div>

                    <p>
                      Downstream response
                      received and correlated
                      with this refill case.
                    </p>
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      marginTop: 14,
                    }}
                    onClick={() =>
                      simulateResponse(
                        selected
                      )
                    }
                  >
                    <ArrowRight
                      size={16}
                    />
                    Simulate Response
                    Received
                  </button>
                </section>
              )}

              {selected.state ===
                "VERIFYING" && (
                <section className="card panel">
                  <div className="eyebrow">
                    VERIFICATION
                  </div>

                  <h3
                    style={{
                      marginTop: 6,
                    }}
                  >
                    Validate the outcome
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <VerificationCheck
                      title="Case correlation"
                      description="Response corresponds to the correct refill case."
                    />

                    <VerificationCheck
                      title="Workflow response"
                      description="Expected downstream response was received."
                    />

                    <VerificationCheck
                      title="Resolution condition"
                      description="Required workflow condition is satisfied."
                    />
                  </div>

                  <button
                    className="btn btn-green"
                    style={{
                      width: "100%",
                      marginTop: 16,
                    }}
                    onClick={() =>
                      verify(selected)
                    }
                  >
                    <CheckCircle2
                      size={16}
                    />
                    Verify & Resolve
                  </button>
                </section>
              )}

              <section className="card panel">
                <div className="eyebrow">
                  HUMAN CONTROL
                </div>

                <h3
                  style={{
                    marginTop: 7,
                  }}
                >
                  AI does not prescribe
                </h3>

                <p
                  className="small-muted"
                  style={{
                    marginTop: 7,
                  }}
                >
                  The resolver understands the
                  workflow, identifies blockers,
                  prepares actions and stops
                  when uncertainty is too high.
                </p>

                <div
                  className="callout red"
                  style={{
                    marginTop: 14,
                  }}
                >
                  <p>
                    <strong>
                      Clinical authorization:
                    </strong>{" "}
                    remains with the authorized
                    provider.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {notice && (
            <Toast message={notice} />
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar />

      <main className="page">
        <div className="hero">
          <div>
            <div className="eyebrow">
              REFILLOPS · OPERATIONS
            </div>

            <h1>
              Refill Command Center
            </h1>

            <p>
              One operational view for what
              is stuck, why it is stuck, who
              owns the next action, and
              whether the refill was actually
              resolved.
            </p>
          </div>

          <div className="hero-actions">
            <button
              className="btn btn-ghost"
              onClick={resetDemo}
            >
              <Zap size={15} />
              Reset demo
            </button>

            <button
              className="btn btn-primary"
              onClick={() =>
                showNotice(
                  "System check complete. Synthetic refill dataset loaded."
                )
              }
            >
              <Bot size={15} />
              Run system check
            </button>
          </div>
        </div>

        <section className="kpis">
          <Kpi
            label="Needs attention"
            value={String(
              metrics.attention
            )}
            sub="Active exception queue"
            icon={
              <Filter size={17} />
            }
          />

          <Kpi
            label="Provider review"
            value={String(
              metrics.provider
            )}
            sub="Human authorization"
            icon={
              <UserCheck
                size={17}
              />
            }
          />

          <Kpi
            label="High priority"
            value={String(
              metrics.high
            )}
            sub="Requires attention"
            icon={
              <Clock3 size={17} />
            }
          />

          <Kpi
            label="Verification"
            value={String(
              metrics.verification
            )}
            sub="Awaiting confirmation"
            icon={
              <FileCheck2
                size={17}
              />
            }
          />

          <Kpi
            label="Resolved"
            value={String(
              metrics.resolved
            )}
            sub="Verified terminal state"
            icon={
              <CheckCircle2
                size={17}
              />
            }
          />
        </section>

        <section>
          <div className="section-head">
            <div>
              <h2>
                Refills Requiring
                Attention
              </h2>

              <div className="muted">
                Every row answers:
                what · why · who · next
              </div>
            </div>

            <div className="filters">
              <button
                className={`filter ${
                  filter === "ALL"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter("ALL")
                }
              >
                All
              </button>

              <button
                className={`filter ${
                  filter === "HIGH"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter("HIGH")
                }
              >
                High priority
              </button>

              <button
                className={`filter ${
                  filter ===
                  "PROVIDER"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter(
                    "PROVIDER"
                  )
                }
              >
                Provider
              </button>

              <button
                className={`filter ${
                  filter ===
                  "INSURANCE"
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setFilter(
                    "INSURANCE"
                  )
                }
              >
                Insurance
              </button>
            </div>
          </div>

          <div className="card case-list">
            <div className="case-row case-head">
              <div>Refill</div>
              <div>State</div>
              <div>Why stuck</div>
              <div>Owner</div>
              <div>Waiting</div>
              <div>Next action</div>
              <div></div>
            </div>

            {filteredCases.length ===
            0 ? (
              <div className="empty">
                No refill cases match this
                filter.
              </div>
            ) : (
              filteredCases.map(
                (item) => (
                  <div
                    className="case-row"
                    key={item.id}
                  >
                    <div>
                      <div className="case-number">
                        {
                          item.caseNumber
                        }
                      </div>

                      <div className="case-patient">
                        {item.patient}
                      </div>
                    </div>

                    <div>
                      <span
                        className={statePill(
                          item.state
                        )}
                      >
                        {prettyState(
                          item.state
                        )}
                      </span>
                    </div>

                    <div className="small-muted">
                      <strong>
                        {prettyBlocker(
                          item.blocker
                        )}
                      </strong>

                      <div
                        style={{
                          marginTop: 3,
                        }}
                      >
                        {
                          item.aiSummary
                        }
                      </div>
                    </div>

                    <div className="small-muted">
                      {item.owner}
                    </div>

                    <div className="small-muted">
                      {item.state ===
                      "RESOLVED"
                        ? "—"
                        : item.waiting}
                    </div>

                    <div className="action-cell">
                      {
                        item.nextAction
                      }
                    </div>

                    <button
                      className="btn open-btn"
                      onClick={() =>
                        openCase(
                          item.id
                        )
                      }
                    >
                      <ArrowRight
                        size={15}
                      />
                      Open
                    </button>
                  </div>
                )
              )
            )}
          </div>
        </section>

        <section
          className="card panel"
          style={{
            marginTop: 16,
          }}
        >
          <div className="section-head">
            <div>
              <h2>
                Operational Value
              </h2>

              <span className="small-muted">
                Synthetic demo metrics
              </span>
            </div>

            <Target
              size={20}
              color="var(--cyan)"
            />
          </div>

          <div className="info-grid">
            <MetricValue
              label="Resolution rate"
              value={`${metrics.resolutionRate}%`}
              description="Cases reaching a verified terminal state"
            />

            <MetricValue
              label="Context visibility"
              value={`${metrics.contextCoverage}%`}
              description="Cases with owner, blocker and next action"
            />

            <MetricValue
              label="Audit coverage"
              value={`${metrics.auditCoverage}%`}
              description="Demo cases with recorded workflow events"
            />

            <MetricValue
              label="Escalated"
              value={String(
                metrics.escalated
              )}
              description="Cases intentionally routed to human review"
            />
          </div>
        </section>

        <section
          className="card panel"
          style={{
            marginTop: 16,
          }}
        >
          <div className="section-head">
            <div>
              <h2>
                Why a Practice Would Care
              </h2>

              <span className="small-muted">
                Product value
              </span>
            </div>

            <Activity
              size={20}
              color="var(--cyan)"
            />
          </div>

          <div className="info-grid">
            <Info
              label="VISIBILITY"
              value="Every stuck refill has a visible reason, owner and next action."
            />

            <Info
              label="COORDINATION"
              value="The system coordinates the next workflow step instead of creating another disconnected inbox."
            />

            <Info
              label="CONTROL"
              value="AI prepares workflow actions while consequential clinical decisions remain human-controlled."
            />

            <Info
              label="VERIFICATION"
              value="A case is not marked resolved until the downstream outcome is checked."
            />
          </div>

          <p className="footer-note">
            Demo note: these are product capabilities,
            not claims of measured production performance.
            All patient and prescription information is
            synthetic.
          </p>
        </section>

        <section
          className="card panel"
          style={{
            marginTop: 16,
          }}
        >
          <div className="section-head">
            <h2>
              System Design Signals
            </h2>

            <span className="small-muted">
              Product · Intelligence · Safety · Market
            </span>
          </div>

          <div className="info-grid">
            <Info
              label="PRODUCT"
              value="Command center + closed-loop refill resolution"
            />

            <Info
              label="INTELLIGENCE"
              value="Understand → recommend → human gate → verify"
            />

            <Info
              label="UNCERTAINTY"
              value="Low-confidence cases stop and escalate instead of guessing"
            />

            <Info
              label="MARKET"
              value="Practice operations / refill exception workflow"
            />
          </div>

          <p className="footer-note">
            Demo note: external pharmacy, provider and
            payer interactions are simulated so the
            prototype demonstrates the closed-loop
            workflow without representing production
            healthcare integrations.
          </p>
        </section>

        {notice && (
          <Toast message={notice} />
        )}
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          RO
        </div>

        <div className="brand-copy">
          <strong>
            REFILLOPS
          </strong>

          <span>
            Refill operations
            orchestration
          </span>
        </div>
      </div>

      <div className="demo-badge">
        DEMO · SYNTHETIC DATA
      </div>
    </header>
  );
}

function Kpi({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
}) {
  return (
    <div className="card kpi">
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <span className="label">
          {label}
        </span>

        <span
          style={{
            color: "var(--cyan)",
          }}
        >
          {icon}
        </span>
      </div>

      <div className="value">
        {value}
      </div>

      <div className="sub">
        {sub}
      </div>
    </div>
  );
}

function MetricValue({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="info">
      <div className="k">
        {label}
      </div>

      <div
        className="v"
        style={{
          fontSize: 20,
        }}
      >
        {value}
      </div>

      <div
        className="small-muted"
        style={{
          marginTop: 4,
        }}
      >
        {description}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="info">
      <div className="k">
        {label}
      </div>

      <div className="v">
        {value}
      </div>
    </div>
  );
}

function VerifiedPill() {
  return (
    <span className="pill pill-blue">
      <ShieldCheck size={12} />
      Verified context
    </span>
  );
}

function VerificationCheck({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <CheckCircle2
        size={16}
        color="#52e0a3"
      />

      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {title}
        </div>

        <div
          className="small-muted"
          style={{
            marginTop: 3,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

function ProviderGate({
  item,
  approve,
  decline,
  moreInfo,
}: {
  item: CaseItem;
  approve: () => void;
  decline: () => void;
  moreInfo: () => void;
}) {
  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [
    providerPin,
    setProviderPin,
  ] = useState("");

  const [
    attempted,
    setAttempted,
  ] = useState(false);

  const correctPin =
    providerPin === "2468";

  function authenticate() {
    setAttempted(true);

    if (correctPin) {
      setAuthenticated(true);
    }
  }

  return (
    <section className="card panel">
      <div className="auth-box">
        <div className="status">
          HUMAN AUTHORIZATION REQUIRED
        </div>

        <h3>
          Provider Review Gate
        </h3>

        <p>
          AI has prepared the operational
          workflow. The authorized provider
          remains responsible for the
          consequential clinical decision.
        </p>

        <div
          className="info-grid two"
          style={{
            marginTop: 12,
          }}
        >
          <Info
            label="PROVIDER"
            value={item.provider}
          />

          <Info
            label="REQUEST"
            value="Continue refill workflow"
          />

          <Info
            label="AUTH TYPE"
            value="Demo provider verification"
          />

          <Info
            label="CLINICAL CONTROL"
            value="Provider"
          />
        </div>

        {!authenticated ? (
          <>
            <div
              className="callout"
              style={{
                marginTop: 14,
              }}
            >
              <div className="k">
                DEMO AUTHENTICATION
              </div>

              <p>
                Enter the provider demo PIN
                to continue.
              </p>

              <input
                value={providerPin}
                onChange={(event) =>
                  setProviderPin(
                    event.target.value
                  )
                }
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit PIN"
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding:
                    "11px 12px",
                  borderRadius: 10,
                  border:
                    "1px solid #d1d9e0",
                  background:
                    "#ffffff",
                  color: "#263653",
                  outline: "none",
                }}
              />

              {attempted &&
                !correctPin && (
                  <div
                    style={{
                      marginTop: 8,
                      color: "#c53030",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    Provider verification
                    failed. Try again.
                  </div>
                )}
            </div>

            <button
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: 14,
              }}
              onClick={authenticate}
            >
              <LockKeyhole
                size={15}
              />
              Authenticate Provider
            </button>

            <div
              className="small-muted"
              style={{
                marginTop: 9,
                textAlign: "center",
              }}
            >
              Demo-only authentication:
              PIN <strong>2468</strong>
            </div>
          </>
        ) : (
          <>
            <div
              className="callout green"
              style={{
                marginTop: 14,
              }}
            >
              <h4>
                <UserCheck
                  size={15}
                />
                Provider authenticated
              </h4>

              <p>
                Identity verified in demo
                mode. The provider can now
                make the workflow decision.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gap: 8,
                marginTop: 12,
              }}
            >
              <button
                className="btn btn-green"
                onClick={approve}
              >
                <CheckCircle2
                  size={15}
                />
                Approve Workflow Action
              </button>

              <button
                className="btn btn-red"
                onClick={decline}
              >
                <XCircle
                  size={15}
                />
                Decline
              </button>

              <button
                className="btn btn-ghost"
                onClick={
                  moreInfo
                }
              >
                Request More
                Information
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function Toast({
  message,
}: {
  message: string;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 22,
        right: 22,
        zIndex: 50,
        padding: "13px 18px",
        minWidth: 190,
        borderRadius: 12,
        border: "1px solid #1D4ED8",
        background: "#2563EB",
        color: "#FFFFFF",
        boxShadow: "0 10px 28px rgba(37, 99, 235, 0.28)",
        fontSize: 14,
        fontWeight: 700,
        lineHeight: 1.4,
        letterSpacing: "0.01em",
      }}
    >
      {message}
    </div>
  );
}

function nowTime() {
  return new Date().toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function prettyBlocker(
  v: Blocker
) {
  return v
    .split("_")
    .map(
      (w) =>
        w.charAt(0) +
        w.slice(1).toLowerCase()
    )
    .join(" ");
}

function prettyState(
  v: State
) {
  return v ===
    "AWAITING_PROVIDER_REVIEW"
    ? "Awaiting Provider Review"
    : v
        .replaceAll(
          "_",
          " "
        )
        .replace(
          /\b\w/g,
          (m) =>
            m.toUpperCase()
        );
}

function stateIndex(
  v: State
) {
  return [
    "BLOCKED",
    "ACTION_READY",
    "AWAITING_PROVIDER_REVIEW",
    "ACTION_SENT",
    "VERIFYING",
    "RESOLVED",
  ].indexOf(v);
}

function stateIndexFromLabel(
  v: string
) {
  const normalized =
    v === "PROVIDER REVIEW"
      ? "AWAITING_PROVIDER_REVIEW"
      : v === "VERIFY"
        ? "VERIFYING"
        : v.replaceAll(
            " ",
            "_"
          );

  return stateIndex(
    normalized as State
  );
}

function statePill(
  v: State
) {
  if (v === "RESOLVED")
    return "pill pill-green";

  if (
    v ===
    "AWAITING_PROVIDER_REVIEW"
  )
    return "pill pill-red";

  if (
    v === "ACTION_SENT" ||
    v === "VERIFYING"
  )
    return "pill pill-blue";

  if (v === "ACTION_READY")
    return "pill pill-blue";

  return "pill pill-amber";
}

function priorityPill(
  v: "HIGH" | "MEDIUM"
) {
  return v === "HIGH"
    ? "pill pill-red"
    : "pill pill-amber";
}

