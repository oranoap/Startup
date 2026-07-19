import type {
  ExtractionInput,
  ExtractionProvider,
  ExtractionResult,
} from "./provider";

// Deterministic extraction used when no ANTHROPIC_API_KEY is configured.
// Produces plausible dental-policy fields keyed off the declared document
// type so the full upload → extract → review → rules flow is demoable.

function guessKind(input: ExtractionInput): "pl" | "bop" | "wc" | "cyber" | "other" {
  const t = (input.documentType + " " + input.documentName).toLowerCase();
  if (/malpractice|professional|liab.*pl|\bpl\b/.test(t)) return "pl";
  if (/bop|business owner|property|general liab/.test(t)) return "bop";
  if (/work.*comp|wc\b/.test(t)) return "wc";
  if (/cyber|breach|privacy/.test(t)) return "cyber";
  return "other";
}

export const mockProvider: ExtractionProvider = {
  name: "mock",
  async extract(input: ExtractionInput): Promise<ExtractionResult> {
    const kind = guessKind(input);
    const profile = JSON.parse(input.practiceProfile || "{}") as {
      sedationServices?: boolean;
      treatingDentists?: number;
      namedInsureds?: number;
    };

    if (kind === "pl") {
      const sedationGap = profile.sedationServices === true;
      return {
        document_type: "Professional liability (malpractice)",
        completeness_note:
          "Document appears complete. Verify all endorsements are attached.",
        fields: [
          { label: "Per-claim limit", value: "$1,000,000", confidence: "high", status: "confirmed", page: 3, source_text: "Limit of Liability — Each Claim: $1,000,000." },
          { label: "Aggregate limit", value: "$3,000,000", confidence: "high", status: "confirmed", page: 3, source_text: "Limit of Liability — Annual Aggregate: $3,000,000." },
          { label: "Coverage form", value: "Claims-made", confidence: "high", status: "limitation", page: 4, source_text: "This policy is written on a CLAIMS-MADE basis." },
          { label: "Retroactive date", value: "March 1, 2019", confidence: "medium", status: "requires-confirmation", page: 4, source_text: "Retroactive Date: March 1, 2019." },
          { label: "Sedation / anesthesia coverage", value: sedationGap ? "Excluded — IV sedation (Section IV(k))" : "No sedation exclusion found", confidence: "high", status: sedationGap ? "potential-gap" : "confirmed", page: 23, source_text: "…administration of general anesthesia, deep sedation, or intravenous moderate sedation…" },
          { label: "Tail / ERP option", value: "Not found in policy body", confidence: "low", status: "missing-info", page: 12, source_text: null },
        ],
        findings: sedationGap
          ? [
              {
                title: "IV sedation exclusion conflicts with practice services",
                coverage_category: "Professional liability",
                status: "potential-gap",
                severity: "Critical",
                practice_exposure: "Practice profile indicates sedation services are offered.",
                policy_evidence: "Section IV(k) excludes IV moderate sedation unless added by endorsement.",
                source_citations: `${input.documentName}, p. 23, Section IV(k)`,
                analysis_rule_applied: "PL-014",
                explanation: "The exclusion applies to the highest-severity claim scenario this practice faces. No sedation endorsement was found in the supplied document.",
                recommended_next_action: "Request an anesthesia/sedation endorsement quote from the carrier.",
                information_still_needed: "Confirm whether an endorsement schedule exists beyond the supplied pages.",
                confidence: "high",
              },
              {
                title: "Tail provision not documented",
                coverage_category: "Professional liability",
                status: "missing-info",
                severity: "Important",
                practice_exposure: "Claims-made coverage requires a documented ERP option at transition.",
                policy_evidence: "Section V is marked reserved; no ERP endorsement supplied.",
                source_citations: `${input.documentName}, p. 12, Section V`,
                analysis_rule_applied: "PL-006",
                explanation: "Absence of documentation is not evidence of absence of the option; carrier confirmation is required.",
                recommended_next_action: "Obtain written ERP terms from the carrier.",
                information_still_needed: "ERP endorsement or carrier confirmation letter.",
                confidence: "medium",
              },
            ]
          : [],
      };
    }

    if (kind === "cyber") {
      return {
        document_type: "Cyber liability declarations",
        completeness_note:
          "Declarations only — the full policy form was not supplied.",
        fields: [
          { label: "Aggregate limit", value: "$250,000", confidence: "high", status: "limitation", page: 1, source_text: "Aggregate Limit of Liability: $250,000 each policy period." },
          { label: "Ransomware sublimit", value: "$100,000", confidence: "high", status: "limitation", page: 1, source_text: "Ransomware / Cyber Extortion Sublimit: $100,000." },
          { label: "Full policy form", value: "Not provided", confidence: "low", status: "missing-info", page: 1, source_text: null },
        ],
        findings: [
          {
            title: "Cyber limits below PHI exposure benchmark",
            coverage_category: "Cyber",
            status: "limitation",
            severity: "Important",
            practice_exposure: "Practice holds protected health information subject to HIPAA.",
            policy_evidence: "Declarations show a $250,000 aggregate.",
            source_citations: `${input.documentName}, p. 1`,
            analysis_rule_applied: "CY-002",
            explanation: "Rule CY-002 benchmarks cyber limits against record count; the declared aggregate is below the computed exposure.",
            recommended_next_action: "Quote increased limits at renewal.",
            information_still_needed: "Full policy form to confirm coverage grants and exclusions.",
            confidence: "high",
          },
        ],
      };
    }

    // bop / wc / other — generic but honest about uncertainty
    return {
      document_type: input.documentType || "Insurance policy",
      completeness_note:
        "Automated review could not classify all sections; analyst review recommended.",
      fields: [
        { label: "Named insured", value: input.practiceName, confidence: "medium", status: "confirmed", page: 1, source_text: null },
        { label: "Policy period", value: "See declarations", confidence: "low", status: "requires-confirmation", page: 1, source_text: null },
        { label: "Limits of liability", value: "See declarations", confidence: "low", status: "requires-confirmation", page: 2, source_text: null },
      ],
      findings: [],
    };
  },
};
