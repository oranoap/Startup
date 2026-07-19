import Anthropic from "@anthropic-ai/sdk";
import {
  ANALYSIS_SYSTEM_PROMPT,
  SCHEMA_INSTRUCTIONS,
} from "./system-prompt";
import type {
  ExtractionInput,
  ExtractionProvider,
  ExtractionResult,
} from "./provider";

const STATUS_ENUM = [
  "confirmed",
  "limitation",
  "potential-gap",
  "missing-info",
  "requires-confirmation",
  "not-applicable",
];
const CONFIDENCE_ENUM = ["high", "medium", "low"];

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["document_type", "completeness_note", "fields", "findings"],
  properties: {
    document_type: { type: "string" },
    completeness_note: { type: "string" },
    fields: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value", "confidence", "status", "page", "source_text"],
        properties: {
          label: { type: "string" },
          value: { type: "string" },
          confidence: { type: "string", enum: CONFIDENCE_ENUM },
          status: { type: "string", enum: STATUS_ENUM },
          page: { type: "integer" },
          source_text: { type: ["string", "null"] },
        },
      },
    },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title", "coverage_category", "status", "severity",
          "practice_exposure", "policy_evidence", "source_citations",
          "analysis_rule_applied", "explanation", "recommended_next_action",
          "information_still_needed", "confidence",
        ],
        properties: {
          title: { type: "string" },
          coverage_category: { type: "string" },
          status: { type: "string", enum: STATUS_ENUM },
          severity: {
            type: "string",
            enum: ["Critical", "Important", "Clarification", "Strength"],
          },
          practice_exposure: { type: "string" },
          policy_evidence: { type: "string" },
          source_citations: { type: "string" },
          analysis_rule_applied: { type: ["string", "null"] },
          explanation: { type: "string" },
          recommended_next_action: { type: "string" },
          information_still_needed: { type: ["string", "null"] },
          confidence: { type: "string", enum: CONFIDENCE_ENUM },
        },
      },
    },
  },
};

export const claudeProvider: ExtractionProvider = {
  name: "claude",
  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    const client = new Anthropic();
    const model = process.env.EXTRACTION_MODEL || "claude-opus-4-8";

    const rulesBlock = input.rules
      .map(
        (r) =>
          `- ${r.code} (${r.severity}) ${r.title}\n  Trigger: ${r.trigger}\n  ${r.description}`
      )
      .join("\n");

    const stream = client.messages.stream({
      model,
      max_tokens: 64000,
      thinking: { type: "adaptive" },
      system: ANALYSIS_SYSTEM_PROMPT + SCHEMA_INSTRUCTIONS,
      output_config: {
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: input.pdf.toString("base64"),
              },
            },
            {
              type: "text",
              text: `Analyze the attached policy document for a dental-practice insurance gap analysis.

Document name: ${input.documentName}
Expected document type: ${input.documentType}
Practice: ${input.practiceName}

DENTAL-PRACTICE EXPOSURE PROFILE (JSON)
${input.practiceProfile}

APPROVED ANALYSIS RULES
${rulesBlock}

Extract the material coverage fields with page citations and supporting
language, then produce findings by comparing the extracted information
against the exposure profile and the approved rules only.`,
            },
          ],
        },
      ],
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      throw new Error("Extraction was declined by the model's safety system.");
    }

    const text = message.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      throw new Error("Extraction returned no structured output.");
    }
    return JSON.parse(text.text) as ExtractionResult;
  },
};
