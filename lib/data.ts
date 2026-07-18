export type Status =
  | "confirmed"
  | "potential-gap"
  | "limitation"
  | "missing-info"
  | "requires-confirmation"
  | "not-applicable";

export const STATUS_META: Record<
  Status,
  { label: string; dot: string; badge: string }
> = {
  confirmed: {
    label: "Confirmed",
    dot: "bg-emerald-600",
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  },
  "potential-gap": {
    label: "Potential gap",
    dot: "bg-red-600",
    badge: "bg-red-50 text-red-800 ring-red-600/20",
  },
  limitation: {
    label: "Limitation",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-900 ring-amber-600/25",
  },
  "missing-info": {
    label: "Missing information",
    dot: "bg-violet-600",
    badge: "bg-violet-50 text-violet-800 ring-violet-600/20",
  },
  "requires-confirmation": {
    label: "Requires confirmation",
    dot: "bg-blue-600",
    badge: "bg-blue-50 text-blue-800 ring-blue-600/20",
  },
  "not-applicable": {
    label: "Not applicable",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  },
};

export type Confidence = "high" | "medium" | "low";

export interface Practice {
  id: string;
  name: string;
  location: string;
  specialty: string;
  dentists: number;
  locations: number;
  broker: string;
  analysisStatus: "In review" | "Complete" | "Awaiting documents" | "Draft report";
  progress: number;
  updated: string;
}

export const practices: Practice[] = [
  {
    id: "p1",
    name: "Lakeview Family Dental",
    location: "Naperville, IL",
    specialty: "General dentistry",
    dentists: 4,
    locations: 2,
    broker: "M. Okafor",
    analysisStatus: "In review",
    progress: 68,
    updated: "Today, 9:41 AM",
  },
  {
    id: "p2",
    name: "Summit Oral Surgery Associates",
    location: "Denver, CO",
    specialty: "Oral & maxillofacial surgery",
    dentists: 3,
    locations: 1,
    broker: "J. Whitfield",
    analysisStatus: "Draft report",
    progress: 92,
    updated: "Today, 8:15 AM",
  },
  {
    id: "p3",
    name: "Harborview Pediatric Dentistry",
    location: "Portsmouth, NH",
    specialty: "Pediatric dentistry",
    dentists: 2,
    locations: 1,
    broker: "M. Okafor",
    analysisStatus: "Awaiting documents",
    progress: 25,
    updated: "Yesterday",
  },
  {
    id: "p4",
    name: "Prairie Endodontics Group",
    location: "Lincoln, NE",
    specialty: "Endodontics",
    dentists: 5,
    locations: 3,
    broker: "R. Castellanos",
    analysisStatus: "Complete",
    progress: 100,
    updated: "Jul 14",
  },
  {
    id: "p5",
    name: "Bright Arbor Orthodontics",
    location: "Ann Arbor, MI",
    specialty: "Orthodontics",
    dentists: 2,
    locations: 2,
    broker: "J. Whitfield",
    analysisStatus: "In review",
    progress: 44,
    updated: "Jul 15",
  },
  {
    id: "p6",
    name: "Cypress Dental Partners",
    location: "Houston, TX",
    specialty: "General dentistry (DSO affiliate)",
    dentists: 11,
    locations: 6,
    broker: "R. Castellanos",
    analysisStatus: "Complete",
    progress: 100,
    updated: "Jul 11",
  },
];

export interface PolicyDocument {
  id: string;
  name: string;
  type: string;
  carrier: string;
  pages: number;
  completeness: "Complete" | "Partial" | "Missing pages" | "Not received";
  fieldsExtracted: number;
  fieldsTotal: number;
}

export const documents: PolicyDocument[] = [
  {
    id: "d1",
    name: "Professional Liability Policy",
    type: "Malpractice / PL",
    carrier: "Meridian Assurance",
    pages: 42,
    completeness: "Complete",
    fieldsExtracted: 18,
    fieldsTotal: 18,
  },
  {
    id: "d2",
    name: "Business Owners Policy",
    type: "BOP (Property + GL)",
    carrier: "Cornerstone Mutual",
    pages: 67,
    completeness: "Complete",
    fieldsExtracted: 24,
    fieldsTotal: 24,
  },
  {
    id: "d3",
    name: "Workers' Compensation Policy",
    type: "Workers' comp",
    carrier: "Pinnacle State Fund",
    pages: 18,
    completeness: "Partial",
    fieldsExtracted: 9,
    fieldsTotal: 14,
  },
  {
    id: "d4",
    name: "Cyber Liability Declarations",
    type: "Cyber / data breach",
    carrier: "Meridian Assurance",
    pages: 6,
    completeness: "Missing pages",
    fieldsExtracted: 5,
    fieldsTotal: 12,
  },
  {
    id: "d5",
    name: "Umbrella Policy",
    type: "Commercial umbrella",
    carrier: "—",
    pages: 0,
    completeness: "Not received",
    fieldsExtracted: 0,
    fieldsTotal: 10,
  },
];

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: Confidence;
  status: Status;
  page: number;
  decision?: "approved" | "edited" | "rejected";
}

export const extractedFields: ExtractedField[] = [
  {
    id: "f1",
    label: "Per-claim limit",
    value: "$1,000,000",
    confidence: "high",
    status: "confirmed",
    page: 3,
    decision: "approved",
  },
  {
    id: "f2",
    label: "Aggregate limit",
    value: "$3,000,000",
    confidence: "high",
    status: "confirmed",
    page: 3,
    decision: "approved",
  },
  {
    id: "f3",
    label: "Coverage form",
    value: "Claims-made",
    confidence: "high",
    status: "limitation",
    page: 4,
  },
  {
    id: "f4",
    label: "Retroactive date",
    value: "March 1, 2019",
    confidence: "medium",
    status: "requires-confirmation",
    page: 4,
  },
  {
    id: "f5",
    label: "Tail / ERP option",
    value: "Not found in policy",
    confidence: "low",
    status: "potential-gap",
    page: 12,
  },
  {
    id: "f6",
    label: "Consent-to-settle clause",
    value: "Pure consent (no hammer)",
    confidence: "medium",
    status: "confirmed",
    page: 17,
  },
  {
    id: "f7",
    label: "Sedation / anesthesia coverage",
    value: "Excluded — IV sedation",
    confidence: "high",
    status: "potential-gap",
    page: 23,
  },
  {
    id: "f8",
    label: "Locum tenens provision",
    value: "45 days per policy period",
    confidence: "medium",
    status: "limitation",
    page: 26,
  },
  {
    id: "f9",
    label: "Named insureds — associates",
    value: "2 of 4 dentists listed",
    confidence: "high",
    status: "missing-info",
    page: 2,
  },
];

export interface RiskRule {
  id: string;
  code: string;
  title: string;
  category: string;
  severity: "Critical" | "Important" | "Advisory";
  description: string;
}

export const riskRules: RiskRule[] = [
  {
    id: "r1",
    code: "PL-014",
    title: "IV sedation exclusion vs. clinical services",
    category: "Professional liability",
    severity: "Critical",
    description:
      "If the practice administers IV or moderate sedation, an anesthesia exclusion on the malpractice policy leaves the highest-severity claim scenario uninsured.",
  },
  {
    id: "r2",
    code: "PL-006",
    title: "Claims-made policy without tail confirmation",
    category: "Professional liability",
    severity: "Important",
    description:
      "Claims-made coverage requires a documented extended reporting period (tail) option; absence creates a gap at retirement, carrier change or practice sale.",
  },
  {
    id: "r3",
    code: "PL-021",
    title: "Unlisted treating dentists",
    category: "Professional liability",
    severity: "Critical",
    description:
      "Every treating dentist, including part-time associates, must appear as a named or scheduled insured. Unlisted clinicians may have no coverage at all.",
  },
  {
    id: "r4",
    code: "BOP-load",
    title: "Equipment breakdown for CAD/CAM and imaging",
    category: "Property",
    severity: "Important",
    description:
      "CBCT scanners, mills and sterilization equipment need equipment-breakdown coverage at replacement value; standard BOP forms often sublimit this.",
  },
  {
    id: "r5",
    code: "CY-002",
    title: "HIPAA-adequate cyber limits",
    category: "Cyber",
    severity: "Important",
    description:
      "Dental practices hold PHI; cyber limits should reflect OCR penalty exposure and patient-notification costs, typically $1M+ for a multi-dentist practice.",
  },
  {
    id: "r6",
    code: "WC-003",
    title: "Part-time hygienist classification",
    category: "Workers' compensation",
    severity: "Advisory",
    description:
      "Verify hygienists and assistants are classified under the correct dental class codes; misclassification triggers audit premium and disputes.",
  },
];

export interface Finding {
  id: string;
  severity: "Critical" | "Important" | "Clarification" | "Strength";
  status: Status;
  title: string;
  detail: string;
  source: string;
  rule?: string;
}

export const findings: Finding[] = [
  {
    id: "g1",
    severity: "Critical",
    status: "potential-gap",
    title: "IV sedation excluded while practice performs sedation dentistry",
    detail:
      "The malpractice policy excludes claims arising from IV sedation (Endorsement E-114), but the practice profile indicates moderate IV sedation is offered at both locations. The most severe claim scenario this practice faces is currently uninsured.",
    source: "Professional Liability Policy, p. 23 · Endorsement E-114",
    rule: "PL-014",
  },
  {
    id: "g2",
    severity: "Critical",
    status: "missing-info",
    title: "Two treating associates not listed as insureds",
    detail:
      "Drs. Patel and Nguyen treat patients at the Ogden Ave location but do not appear on the declarations or any endorsement. If either is named in a claim, coverage is uncertain at best.",
    source: "Professional Liability Policy, p. 2 · Declarations",
    rule: "PL-021",
  },
  {
    id: "g3",
    severity: "Important",
    status: "potential-gap",
    title: "No extended reporting period (tail) option documented",
    detail:
      "The policy is claims-made with a March 2019 retroactive date, but no ERP/tail provision was found in the policy or endorsements. Confirm tail terms with the carrier before any renewal, carrier change or practice transition.",
    source: "Professional Liability Policy, pp. 4, 12",
    rule: "PL-006",
  },
  {
    id: "g4",
    severity: "Important",
    status: "limitation",
    title: "Equipment breakdown sublimited to $50,000",
    detail:
      "The BOP includes equipment breakdown but sublimits it to $50,000 per occurrence. The practice schedule lists a CBCT scanner and CEREC mill with combined replacement value near $310,000.",
    source: "Business Owners Policy, p. 41 · Form CM-7192",
    rule: "BOP-load",
  },
  {
    id: "g5",
    severity: "Important",
    status: "limitation",
    title: "Cyber limit of $250,000 below PHI exposure benchmark",
    detail:
      "With roughly 9,800 active patient records across two locations, notification, forensics and OCR-penalty exposure alone can exceed the current $250,000 aggregate. Benchmark for this profile is $1M.",
    source: "Cyber Liability Declarations, p. 1",
    rule: "CY-002",
  },
  {
    id: "g6",
    severity: "Clarification",
    status: "requires-confirmation",
    title: "Retroactive date predates Ogden Ave acquisition — confirm entity continuity",
    detail:
      "The retro date of March 1, 2019 appears tied to the original entity. Confirm whether the 2021 acquisition of the Ogden Ave practice was added by endorsement or requires separate prior-acts coverage.",
    source: "Professional Liability Policy, p. 4",
  },
  {
    id: "g7",
    severity: "Clarification",
    status: "missing-info",
    title: "Workers' comp policy missing payroll audit schedule",
    detail:
      "Pages 11–15 of the workers' compensation policy (classification and payroll schedule) were not included in the upload. Request the complete policy from the carrier or prior broker.",
    source: "Workers' Compensation Policy — pages missing",
  },
  {
    id: "g8",
    severity: "Strength",
    status: "confirmed",
    title: "Pure consent-to-settle with no hammer clause",
    detail:
      "The malpractice policy requires the insured dentist's written consent to settle and contains no hammer clause — a meaningfully stronger position than the market standard.",
    source: "Professional Liability Policy, p. 17 · Section VI",
  },
  {
    id: "g9",
    severity: "Strength",
    status: "confirmed",
    title: "Per-claim and aggregate limits meet specialty benchmark",
    detail:
      "$1M / $3M limits meet the benchmark for a four-dentist general practice in Illinois, and defense costs are outside the limits.",
    source: "Professional Liability Policy, p. 3 · Declarations",
  },
  {
    id: "g10",
    severity: "Strength",
    status: "confirmed",
    title: "Locum tenens provision covers scheduled absences",
    detail:
      "A 45-day locum tenens provision allows credentialed substitute dentists during leave without a coverage break, subject to carrier notice.",
    source: "Professional Liability Policy, p. 26",
  },
];

export interface GapAnalysis {
  id: string;
  practice: string;
  policies: number;
  documents: number;
  critical: number;
  important: number;
  clarifications: number;
  stage: "Extraction" | "Field review" | "Findings review" | "Report drafted" | "Delivered";
  progress: number;
  analyst: string;
  updated: string;
}

export const gapAnalyses: GapAnalysis[] = [
  {
    id: "a1",
    practice: "Lakeview Family Dental",
    policies: 5,
    documents: 4,
    critical: 2,
    important: 3,
    clarifications: 2,
    stage: "Findings review",
    progress: 68,
    analyst: "M. Okafor",
    updated: "Today, 9:41 AM",
  },
  {
    id: "a2",
    practice: "Summit Oral Surgery Associates",
    policies: 6,
    documents: 6,
    critical: 1,
    important: 4,
    clarifications: 1,
    stage: "Report drafted",
    progress: 92,
    analyst: "J. Whitfield",
    updated: "Today, 8:15 AM",
  },
  {
    id: "a3",
    practice: "Harborview Pediatric Dentistry",
    policies: 4,
    documents: 1,
    critical: 0,
    important: 1,
    clarifications: 3,
    stage: "Extraction",
    progress: 25,
    analyst: "M. Okafor",
    updated: "Yesterday",
  },
  {
    id: "a4",
    practice: "Prairie Endodontics Group",
    policies: 7,
    documents: 7,
    critical: 1,
    important: 2,
    clarifications: 0,
    stage: "Delivered",
    progress: 100,
    analyst: "R. Castellanos",
    updated: "Jul 14",
  },
  {
    id: "a5",
    practice: "Bright Arbor Orthodontics",
    policies: 5,
    documents: 3,
    critical: 1,
    important: 2,
    clarifications: 2,
    stage: "Field review",
    progress: 44,
    analyst: "J. Whitfield",
    updated: "Jul 15",
  },
];
