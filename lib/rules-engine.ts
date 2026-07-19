import { db } from "./db";

// Deterministic rules engine. Compares extracted fields + the practice
// exposure profile against the approved rule set and proposes findings.
// Proposed findings always enter the analysis as state PROPOSED — they never
// publish to a report without analyst approval and agent sign-off.

interface Profile {
  sedationServices?: boolean;
  treatingDentists?: number;
  namedInsureds?: number;
  patientRecords?: number;
  equipmentValue?: number;
  breakdownSublimit?: number;
  cyberAggregate?: number;
  coverageForm?: string;
  tailProvision?: string;
}

interface FieldView {
  label: string;
  value: string;
  status: string;
  confidence: string;
  page: number;
  documentName: string;
}

interface ProposedFinding {
  ruleCode: string;
  severity: string;
  status: string;
  title: string;
  detail: string;
  source: string;
  /** lowest confidence among supporting evidence */
  confidence: "high" | "medium" | "low";
}

type RuleFn = (profile: Profile, fields: FieldView[]) => ProposedFinding | null;

const find = (fields: FieldView[], re: RegExp) =>
  fields.find((f) => re.test(f.label.toLowerCase()));

const RULES: Record<string, RuleFn> = {
  "PL-014": (profile, fields) => {
    const f = find(fields, /sedation|anesthesia/);
    if (!profile.sedationServices || !f) return null;
    if (!/exclud/i.test(f.value)) return null;
    return {
      ruleCode: "PL-014",
      severity: "Critical",
      status: "potential-gap",
      title: "Sedation services excluded while practice performs sedation dentistry",
      detail:
        "The malpractice policy excludes sedation/anesthesia claims, but the practice profile indicates sedation services are offered. The most severe claim scenario this practice faces may be uninsured.",
      source: `${f.documentName}, p. ${f.page}`,
      confidence: f.confidence as ProposedFinding["confidence"],
    };
  },
  "PL-006": (profile, fields) => {
    const form = find(fields, /coverage form/);
    const tail = find(fields, /tail|erp/);
    const claimsMade =
      profile.coverageForm === "claims-made" ||
      (form ? /claims-made/i.test(form.value) : false);
    const tailMissing =
      profile.tailProvision === "not_found" ||
      (tail ? /not found|not provided|missing/i.test(tail.value) : false);
    if (!claimsMade || !tailMissing) return null;
    return {
      ruleCode: "PL-006",
      severity: "Important",
      status: tail?.status === "missing-info" ? "missing-info" : "potential-gap",
      title: "Claims-made policy without documented tail (ERP) option",
      detail:
        "The policy is claims-made but no extended reporting period provision was found in the supplied documents. Confirm ERP terms with the carrier before any renewal, carrier change or practice transition.",
      source: tail ? `${tail.documentName}, p. ${tail.page}` : "Policy documents as supplied",
      confidence: (tail?.confidence ?? "low") as ProposedFinding["confidence"],
    };
  },
  "PL-021": (profile, fields) => {
    if (
      profile.treatingDentists == null ||
      profile.namedInsureds == null ||
      profile.treatingDentists <= profile.namedInsureds
    )
      return null;
    const f = find(fields, /named insured/);
    return {
      ruleCode: "PL-021",
      severity: "Critical",
      status: "missing-info",
      title: `${profile.treatingDentists - profile.namedInsureds} treating dentist(s) not listed as insureds`,
      detail:
        "The practice profile lists more treating dentists than appear as named or scheduled insureds. Unlisted clinicians may have no coverage at all; add them by endorsement or document their separate coverage.",
      source: f ? `${f.documentName}, p. ${f.page}` : "Declarations as supplied",
      confidence: (f?.confidence ?? "medium") as ProposedFinding["confidence"],
    };
  },
  "BOP-load": (profile, fields) => {
    const f = find(fields, /equipment breakdown/);
    if (
      profile.equipmentValue == null ||
      profile.breakdownSublimit == null ||
      profile.equipmentValue <= profile.breakdownSublimit * 1.5
    )
      return null;
    return {
      ruleCode: "BOP-load",
      severity: "Important",
      status: "limitation",
      title: "Equipment-breakdown sublimit below scheduled equipment value",
      detail: `Scheduled dental equipment (~$${profile.equipmentValue.toLocaleString()}) exceeds the equipment-breakdown sublimit (~$${profile.breakdownSublimit.toLocaleString()}) by more than 1.5×. Raise the sublimit to replacement value at renewal.`,
      source: f ? `${f.documentName}, p. ${f.page}` : "BOP as supplied",
      confidence: (f?.confidence ?? "medium") as ProposedFinding["confidence"],
    };
  },
  "CY-002": (profile, fields) => {
    if (
      profile.patientRecords == null ||
      profile.cyberAggregate == null ||
      profile.patientRecords * 110 <= profile.cyberAggregate
    )
      return null;
    const f = find(fields, /aggregate/);
    return {
      ruleCode: "CY-002",
      severity: "Important",
      status: "limitation",
      title: "Cyber aggregate below PHI exposure benchmark",
      detail: `Approximately ${profile.patientRecords.toLocaleString()} patient records imply notification, forensics and regulatory exposure above the current cyber aggregate. Benchmark per rule CY-002: records × $110.`,
      source: f ? `${f.documentName}, p. ${f.page}` : "Cyber declarations as supplied",
      confidence: (f?.confidence ?? "medium") as ProposedFinding["confidence"],
    };
  },
};

/**
 * Runs all enabled rules for a practice's analysis. Idempotent per rule:
 * a rule that already has a finding (any state) on the analysis is skipped.
 * Enforces: a high-severity finding is never based solely on low-confidence
 * extraction — such findings are demoted to Clarification / requires-confirmation.
 */
export async function runRulesForPractice(practiceId: string) {
  const practice = await db.practice.findUnique({
    where: { id: practiceId },
    include: { documents: { include: { fields: true } }, analyses: { include: { findings: true } } },
  });
  if (!practice) return { proposed: 0 };
  const analysis = practice.analyses[0];
  if (!analysis) return { proposed: 0 };

  const profile = JSON.parse(practice.profile || "{}") as Profile;
  const fields: FieldView[] = practice.documents.flatMap((d) =>
    d.fields.map((f) => ({
      label: f.label,
      value: f.value,
      status: f.status,
      confidence: f.confidence,
      page: f.page,
      documentName: d.name,
    }))
  );

  const enabledRules = await db.rule.findMany({ where: { enabled: true } });
  const existingCodes = new Set(
    analysis.findings.map((f) => f.ruleCode).filter(Boolean)
  );

  let proposed = 0;
  for (const rule of enabledRules) {
    const fn = RULES[rule.code];
    if (!fn || existingCodes.has(rule.code)) continue;
    const result = fn(profile, fields);
    if (!result) continue;

    // Governing prompt: high-severity findings must not rest solely on
    // low-confidence extraction.
    const severity =
      result.confidence === "low" &&
      (result.severity === "Critical" || result.severity === "Important")
        ? "Clarification"
        : result.severity;
    const status =
      severity === "Clarification" && result.status === "potential-gap"
        ? "requires-confirmation"
        : result.status;

    await db.finding.create({
      data: {
        analysisId: analysis.id,
        severity,
        status,
        title: result.title,
        detail: result.detail,
        source: `${result.source} · Rule ${result.ruleCode}`,
        ruleCode: result.ruleCode,
        state: "PROPOSED",
        order: 100 + proposed,
      },
    });
    await db.rule.update({
      where: { id: rule.id },
      data: { firings: { increment: 1 } },
    });
    proposed++;
  }
  return { proposed };
}
