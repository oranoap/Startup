// Extraction provider interface. The Claude provider is used when
// ANTHROPIC_API_KEY is set; otherwise the deterministic mock keeps the whole
// pipeline runnable end-to-end.

export interface ExtractedFieldResult {
  label: string;
  value: string;
  confidence: "high" | "medium" | "low";
  status:
    | "confirmed"
    | "limitation"
    | "potential-gap"
    | "missing-info"
    | "requires-confirmation"
    | "not-applicable";
  page: number;
  source_text: string | null;
}

export interface FindingResult {
  title: string;
  coverage_category: string;
  status: ExtractedFieldResult["status"];
  severity: "Critical" | "Important" | "Clarification" | "Strength";
  practice_exposure: string;
  policy_evidence: string;
  source_citations: string;
  analysis_rule_applied: string | null;
  explanation: string;
  recommended_next_action: string;
  information_still_needed: string | null;
  confidence: "high" | "medium" | "low";
}

export interface ExtractionResult {
  document_type: string;
  completeness_note: string;
  fields: ExtractedFieldResult[];
  findings: FindingResult[];
}

export interface ExtractionInput {
  pdf: Buffer;
  documentName: string;
  documentType: string;
  practiceName: string;
  /** JSON-encoded dental-practice exposure profile */
  practiceProfile: string;
  /** Approved analysis rules, serialized for the prompt */
  rules: { code: string; title: string; severity: string; trigger: string; description: string }[];
}

export interface ExtractionProvider {
  name: string;
  extract(input: ExtractionInput): Promise<ExtractionResult>;
}

export async function getProvider(): Promise<ExtractionProvider> {
  if (process.env.ANTHROPIC_API_KEY) {
    const { claudeProvider } = await import("./claude");
    return claudeProvider;
  }
  const { mockProvider } = await import("./mock");
  return mockProvider;
}
