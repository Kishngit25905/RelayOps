import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const responseSchema = {
  type: "object",
  properties: {
    summary: {
      type: "string",
    },

    recommendedAction: {
      type: "string",
    },

    nextStep: {
      type: "string",
    },

    confidence: {
      type: "string",
      enum: [
        "HIGH",
        "MEDIUM",
        "LOW",
      ],
    },

    humanApprovalRequired: {
      type: "boolean",
    },

    safetyNote: {
      type: "string",
    },
  },

  required: [
    "summary",
    "recommendedAction",
    "nextStep",
    "confidence",
    "humanApprovalRequired",
    "safetyNote",
  ],
};

export async function POST(
  request: Request
) {
  try {
    const caseData = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        {
          error:
            "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const prompt = `
You are the operational intelligence layer for RX Resolve.

Your task is to analyze a synthetic prescription refill
workflow case and recommend the safest operational next step.

You are NOT a doctor.

STRICT RULES:

1. Never prescribe medication.
2. Never select a medication.
3. Never change medication.
4. Never recommend a dosage.
5. Never make a clinical diagnosis.
6. Never independently authorize a prescription.
7. Never claim that AI approval replaces provider authorization.
8. When provider authorization is required, set
   humanApprovalRequired to true.
9. When information is unclear or contradictory,
   recommend human escalation.
10. Focus only on workflow coordination,
    administrative blockers, missing information,
    ownership and next action.

CASE DATA:

${JSON.stringify(caseData, null, 2)}

Return a concise operational analysis.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",

        contents: prompt,

        config: {
          responseMimeType:
            "application/json",

          responseSchema,
        },
      });

    const rawText = response.text ?? "{}";

    let result;

    try {
      result = JSON.parse(rawText);
    } catch {
      return Response.json(
        {
          error:
            "AI returned an invalid structured response.",
        },
        { status: 502 }
      );
    }

    const forcedHumanApproval =
      Boolean(caseData.approvalRequired) ||
      result.humanApprovalRequired === true;

    return Response.json({
      summary:
        result.summary ??
        caseData.summary ??
        "The AI analyzed the refill workflow.",

      recommendedAction:
        result.recommendedAction ??
        caseData.nextAction ??
        "Review the case.",

      nextStep:
        result.nextStep ??
        caseData.nextAction ??
        "Review the case.",

      confidence:
        result.confidence === "HIGH" ||
        result.confidence === "MEDIUM" ||
        result.confidence === "LOW"
          ? result.confidence
          : "MEDIUM",

      humanApprovalRequired:
        forcedHumanApproval,

      safetyNote:
        result.safetyNote ??
        "AI does not make clinical or prescribing decisions.",
    });
  } catch (error) {
    console.error(
      "RX Resolve Gemini error:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI resolution failed.",
      },
      { status: 500 }
    );
  }
}