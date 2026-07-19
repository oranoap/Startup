import { PrismaClient } from "@prisma/client";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import bcrypt from "bcryptjs";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  practices,
  riskRules,
  findings,
  gapAnalyses,
  extractedFields,
} from "../lib/data";

const db = new PrismaClient();

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 72;
const TEXT_W = PAGE_W - MARGIN * 2;

type Bbox = { x: number; y: number; w: number; h: number };

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const probe = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(probe, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws a paragraph starting at yTop; returns the y below it and its bbox. */
function para(
  page: PDFPage,
  text: string,
  yTop: number,
  font: PDFFont,
  size = 10.5,
  indent = 0
): { y: number; bbox: Bbox } {
  const lh = size * 1.45;
  const maxW = TEXT_W - indent;
  const lines = wrap(text, font, size, maxW);
  let y = yTop;
  for (const l of lines) {
    page.drawText(l, { x: MARGIN + indent, y: y - size, size, font, color: rgb(0.15, 0.17, 0.16) });
    y -= lh;
  }
  const bbox: Bbox = {
    x: (MARGIN + indent - 3) / PAGE_W,
    y: (PAGE_H - yTop - 3) / PAGE_H,
    w: (maxW + 6) / PAGE_W,
    h: (yTop - y + 8) / PAGE_H,
  };
  return { y: y - lh * 0.6, bbox };
}

function chrome(page: PDFPage, font: PDFFont, bold: PDFFont, header: string, pageNo: number, total: number, policyNo: string) {
  page.drawText(header, {
    x: MARGIN,
    y: PAGE_H - 40,
    size: 8,
    font: bold,
    color: rgb(0.35, 0.38, 0.37),
  });
  page.drawLine({
    start: { x: MARGIN, y: PAGE_H - 48 },
    end: { x: PAGE_W - MARGIN, y: PAGE_H - 48 },
    thickness: 0.5,
    color: rgb(0.75, 0.78, 0.77),
  });
  page.drawText(`${policyNo} · Page ${pageNo} of ${total} · Ed. 04/2024`, {
    x: MARGIN,
    y: 36,
    size: 7.5,
    font,
    color: rgb(0.55, 0.58, 0.57),
  });
}

const FILLER = [
  "The Company will pay on behalf of the Insured all sums which the Insured shall become legally obligated to pay as damages because of claims arising out of the rendering of or failure to render professional services, subject to the limits of liability, exclusions, conditions and other terms of this policy.",
  "The Insured shall, as a condition precedent to the availability of coverage under this policy, give the Company written notice as soon as practicable of any claim or of any circumstance which could reasonably be expected to give rise to a claim.",
  "The Company shall have the right and duty to defend any claim seeking damages to which this insurance applies, even if the allegations of the claim are groundless, false or fraudulent, and may make such investigation of any claim as it deems expedient.",
  "No action shall lie against the Company unless, as a condition precedent thereto, the Insured shall have fully complied with all of the terms of this policy, nor until the amount of the Insured's obligation to pay shall have been finally determined.",
  "If the Insured and the Company do not agree whether coverage is provided under this policy for a claim made against the Insured, then either party may make a written demand for review in accordance with the conditions set forth herein.",
  "The terms of this policy shall not be waived or changed, except by endorsement issued by the Company to form a part of this policy. Notice to any agent or knowledge possessed by any agent shall not effect a waiver of any provision.",
];

interface SpecialPage {
  section: string;
  paras: { text: string; fieldKey?: string; indent?: number }[];
}

async function buildPolicyPdf(
  title: string,
  policyNo: string,
  totalPages: number,
  specials: Record<number, SpecialPage>
): Promise<{ bytes: Uint8Array; bboxes: Record<string, Bbox> }> {
  const doc = await PDFDocument.create();
  const times = await doc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const bboxes: Record<string, Bbox> = {};

  for (let p = 1; p <= totalPages; p++) {
    const page = doc.addPage([PAGE_W, PAGE_H]);
    chrome(page, times, timesBold, title, p, totalPages, policyNo);
    let y = PAGE_H - 90;
    const special = specials[p];
    if (special) {
      page.drawText(special.section, { x: MARGIN, y: y - 12, size: 11.5, font: timesBold, color: rgb(0.1, 0.12, 0.11) });
      y -= 36;
      for (const sp of special.paras) {
        const r = para(page, sp.text, y, times, 10.5, sp.indent ?? 0);
        if (sp.fieldKey) bboxes[sp.fieldKey] = r.bbox;
        y = r.y;
      }
    } else {
      page.drawText(`SECTION ${Math.min(9, Math.ceil(p / 5))} — GENERAL CONDITIONS (continued)`, {
        x: MARGIN, y: y - 12, size: 11.5, font: timesBold, color: rgb(0.1, 0.12, 0.11),
      });
      y -= 36;
      for (let i = 0; i < 4 && y > 120; i++) {
        y = para(page, FILLER[(p + i) % FILLER.length], y, times).y;
      }
    }
  }
  return { bytes: await doc.save(), bboxes };
}

async function main() {
  // Wipe in dependency order
  await db.finding.deleteMany();
  await db.analysis.deleteMany();
  await db.extractedField.deleteMany();
  await db.document.deleteMany();
  await db.practice.deleteMany();
  await db.rule.deleteMany();
  await db.user.deleteMany();

  // ── Users ──────────────────────────────────────────────────────
  const hash = bcrypt.hashSync("demo1234", 10);
  await db.user.createMany({
    data: [
      { email: "maya@insurancebydentists.com", name: "Maya Okafor", title: "Senior Analyst", role: "ANALYST", passwordHash: hash },
      { email: "jordan@insurancebydentists.com", name: "Jordan Whitfield", title: "Analyst", role: "ANALYST", passwordHash: hash },
      { email: "rafael@insurancebydentists.com", name: "Rafael Castellanos", title: "Analyst", role: "ANALYST", passwordHash: hash },
      { email: "dana@insurancebydentists.com", name: "Dana Reyes, CIC", title: "Licensed Agent", role: "AGENT", passwordHash: hash },
      { email: "priya@insurancebydentists.com", name: "Priya Shah", title: "Operations", role: "ADMIN", passwordHash: hash },
    ],
  });

  // ── Rules ──────────────────────────────────────────────────────
  const triggers: Record<string, string> = {
    "PL-014": "sedation_services = true AND anesthesia_coverage = excluded",
    "PL-006": "coverage_form = claims-made AND tail_provision = not_found",
    "PL-021": "treating_dentists > named_insureds",
    "BOP-load": "equipment_value > breakdown_sublimit × 1.5",
    "CY-002": "patient_records × $110 > cyber_aggregate",
    "WC-003": "class_code NOT IN dental_codes",
  };
  const firings: Record<string, number> = {
    "PL-014": 41, "PL-006": 87, "PL-021": 29, "BOP-load": 63, "CY-002": 118, "WC-003": 12,
  };
  for (const r of riskRules) {
    await db.rule.create({
      data: {
        code: r.code, title: r.title, category: r.category, severity: r.severity,
        description: r.description, trigger: triggers[r.code] ?? "", firings: firings[r.code] ?? 0,
      },
    });
  }

  // ── Practices ──────────────────────────────────────────────────
  const profiles: Record<string, object> = {
    p1: {
      sedationServices: true, treatingDentists: 4, namedInsureds: 2, patientRecords: 9800,
      equipmentValue: 310000, breakdownSublimit: 50000, cyberAggregate: 250000,
      coverageForm: "claims-made", tailProvision: "not_found", wcClassCodes: ["8832"],
      locationsNote: "Ogden Ave location acquired 2021",
    },
    p2: { sedationServices: true, treatingDentists: 3, namedInsureds: 3, patientRecords: 5200, equipmentValue: 480000, breakdownSublimit: 250000, cyberAggregate: 1000000, coverageForm: "occurrence", tailProvision: "n/a", wcClassCodes: ["8832"] },
    p3: { sedationServices: false, treatingDentists: 2, namedInsureds: 2, patientRecords: 4100, equipmentValue: 120000, breakdownSublimit: 100000, cyberAggregate: 500000, coverageForm: "claims-made", tailProvision: "documented", wcClassCodes: ["8832"] },
    p4: { sedationServices: false, treatingDentists: 5, namedInsureds: 5, patientRecords: 7600, equipmentValue: 350000, breakdownSublimit: 350000, cyberAggregate: 1000000, coverageForm: "claims-made", tailProvision: "documented", wcClassCodes: ["8832"] },
    p5: { sedationServices: false, treatingDentists: 2, namedInsureds: 2, patientRecords: 3900, equipmentValue: 260000, breakdownSublimit: 50000, cyberAggregate: 250000, coverageForm: "claims-made", tailProvision: "not_found", wcClassCodes: ["8832"] },
    p6: { sedationServices: true, treatingDentists: 11, namedInsureds: 11, patientRecords: 26400, equipmentValue: 1250000, breakdownSublimit: 1000000, cyberAggregate: 2000000, coverageForm: "occurrence", tailProvision: "n/a", wcClassCodes: ["8832"] },
  };
  const practiceIds: Record<string, string> = {};
  for (const p of practices) {
    const row = await db.practice.create({
      data: {
        name: p.name, location: p.location, specialty: p.specialty, dentists: p.dentists,
        locations: p.locations, broker: p.broker, profile: JSON.stringify(profiles[p.id] ?? {}),
      },
    });
    practiceIds[p.id] = row.id;
  }

  // ── Policy PDFs for Lakeview ───────────────────────────────────
  const uploads = path.join(process.cwd(), "data", "uploads");
  mkdirSync(uploads, { recursive: true });

  const pl = await buildPolicyPdf(
    "MERIDIAN ASSURANCE COMPANY — PROFESSIONAL LIABILITY POLICY",
    "DP-4471-882",
    42,
    {
      2: {
        section: "DECLARATIONS — ITEM 1: NAMED INSUREDS",
        paras: [
          { text: "Named Insured: Lakeview Family Dental, S.C., an Illinois service corporation, and the following individual dentists while acting within the scope of their duties for the Named Insured:" },
          { text: "1. Elena Vasquez, DDS — License IL 019-028311    2. Marcus Webb, DDS — License IL 019-031877", fieldKey: "f9", indent: 14 },
          { text: "No other person or entity is an insured under this policy unless added by written endorsement issued by the Company and attached hereto." },
        ],
      },
      3: {
        section: "DECLARATIONS — ITEM 3: LIMITS OF LIABILITY",
        paras: [
          { text: "Limit of Liability — Each Claim: $1,000,000. The Company's maximum liability for damages arising from any one claim first made during the policy period.", fieldKey: "f1" },
          { text: "Limit of Liability — Annual Aggregate: $3,000,000. The Company's maximum liability for all damages arising from all claims first made during the policy period.", fieldKey: "f2" },
          { text: "Claim expenses (defense costs) are payable in addition to, and do not erode, the limits of liability stated above." },
        ],
      },
      4: {
        section: "DECLARATIONS — ITEM 4: COVERAGE FORM AND RETROACTIVE DATE",
        paras: [
          { text: "This policy is written on a CLAIMS-MADE basis. Coverage applies only to claims first made against the Insured during the policy period and reported to the Company in accordance with Section V.", fieldKey: "f3" },
          { text: "Retroactive Date: March 1, 2019. This policy does not apply to any professional services rendered before the Retroactive Date shown above.", fieldKey: "f4" },
        ],
      },
      12: {
        section: "SECTION V — EXTENDED REPORTING PERIODS",
        paras: [
          { text: "Reserved. Refer to any Extended Reporting Period endorsement attached to this policy, if applicable, for the terms under which an extended reporting period may be purchased.", fieldKey: "f5" },
          { text: "In the absence of such endorsement, the availability of any extended reporting period shall be subject to the Company's then-current rules and rates." },
        ],
      },
      17: {
        section: "SECTION VI — DEFENSE AND SETTLEMENT",
        paras: [
          { text: "The Company shall not settle any claim without the written consent of the Insured. If the Insured refuses to consent to a settlement recommended by the Company, the Company shall continue to defend the claim, and the Insured's liability shall not be limited by reason of such refusal.", fieldKey: "f6" },
        ],
      },
      23: {
        section: "SECTION IV — EXCLUSIONS (continued)",
        paras: [
          { text: "This insurance does not apply to any claim or claim expenses:" },
          { text: "j. arising out of the performance of any procedure for which the insured has not been credentialed by the applicable state dental board, or which falls outside the lawful scope of the insured's license;", indent: 14 },
          { text: "k. arising out of the administration of general anesthesia, deep sedation, or intravenous moderate sedation, whether administered by the insured or by any person for whose acts the insured is legally responsible, unless coverage is specifically added by endorsement to this policy;", fieldKey: "f7", indent: 14 },
          { text: "l. arising out of the prescribing or dispensing of controlled substances other than in the ordinary course of dental treatment and in accordance with applicable federal and state law;", indent: 14 },
          { text: "m. arising out of any express warranty or guarantee of the result of any treatment or procedure, provided that this exclusion shall not apply to liability that would exist in the absence of such warranty;", indent: 14 },
        ],
      },
      26: {
        section: "SECTION VII — LOCUM TENENS PROVISION",
        paras: [
          { text: "Upon prior written notice to the Company, coverage under this policy shall extend to a qualified substitute dentist (locum tenens) rendering professional services on behalf of an Insured who is absent by reason of illness, injury, continuing education or vacation, for a period not to exceed forty-five (45) days in any one policy period.", fieldKey: "f8" },
        ],
      },
    }
  );
  writeFileSync(path.join(uploads, "lakeview-professional-liability.pdf"), pl.bytes);

  const bop = await buildPolicyPdf(
    "CORNERSTONE MUTUAL — BUSINESSOWNERS POLICY",
    "BP-2210-467",
    67,
    {
      41: {
        section: "FORM CM-7192 — EQUIPMENT BREAKDOWN COVERAGE",
        paras: [
          { text: "The most the Company will pay for loss or damage under this Equipment Breakdown coverage arising from any one Breakdown is $50,000, regardless of the number of covered items involved.", fieldKey: "bop-eb" },
          { text: "Covered equipment includes diagnostic imaging equipment, sterilization equipment, and computer-aided design and manufacturing (CAD/CAM) systems while at the described premises." },
        ],
      },
    }
  );
  writeFileSync(path.join(uploads, "lakeview-bop.pdf"), bop.bytes);

  const wc = await buildPolicyPdf(
    "PINNACLE STATE FUND — WORKERS' COMPENSATION AND EMPLOYERS LIABILITY POLICY",
    "WC-8834-105",
    10, // pages 11-15 (schedule) intentionally missing from this upload
    {}
  );
  writeFileSync(path.join(uploads, "lakeview-workers-comp.pdf"), wc.bytes);

  const cyber = await buildPolicyPdf(
    "MERIDIAN ASSURANCE COMPANY — CYBER LIABILITY DECLARATIONS",
    "CY-1190-233",
    6,
    {
      1: {
        section: "DECLARATIONS — LIMITS OF INSURANCE",
        paras: [
          { text: "Aggregate Limit of Liability: $250,000 each policy period, inclusive of claim expenses.", fieldKey: "cy-agg" },
          { text: "Ransomware / Cyber Extortion Sublimit: $100,000 each policy period. Social Engineering Fraud Sublimit: $25,000 each policy period." },
        ],
      },
    }
  );
  writeFileSync(path.join(uploads, "lakeview-cyber-dec.pdf"), cyber.bytes);

  // ── Documents + fields for Lakeview ────────────────────────────
  const lakeview = practiceIds["p1"];
  const mkDoc = (data: {
    name: string; type: string; carrier: string; pages: number;
    completeness: string; status: string; filePath?: string; fieldsTotal: number;
  }) => db.document.create({ data: { ...data, practiceId: lakeview } });

  const d1 = await mkDoc({
    name: "Professional Liability Policy", type: "Malpractice / PL", carrier: "Meridian Assurance",
    pages: 42, completeness: "Complete", status: "extracted",
    filePath: "data/uploads/lakeview-professional-liability.pdf", fieldsTotal: 9,
  });
  const sourceTexts: Record<string, string> = {
    f7: "k. arising out of the administration of general anesthesia, deep sedation, or intravenous moderate sedation…",
    f4: "Retroactive Date: March 1, 2019.",
    f5: "Reserved. Refer to any Extended Reporting Period endorsement attached to this policy, if applicable…",
  };
  let order = 0;
  for (const f of extractedFields) {
    await db.extractedField.create({
      data: {
        documentId: d1.id, label: f.label, value: f.value, confidence: f.confidence,
        status: f.status, page: f.page, decision: f.decision ?? null, order: order++,
        bbox: pl.bboxes[f.id] ? JSON.stringify(pl.bboxes[f.id]) : null,
        sourceText: sourceTexts[f.id] ?? null,
      },
    });
  }

  const d2 = await mkDoc({
    name: "Business Owners Policy", type: "BOP (Property + GL)", carrier: "Cornerstone Mutual",
    pages: 67, completeness: "Complete", status: "extracted",
    filePath: "data/uploads/lakeview-bop.pdf", fieldsTotal: 6,
  });
  const bopFields = [
    { label: "Building limit", value: "$1,450,000 (Naperville)", confidence: "high", status: "confirmed", page: 3 },
    { label: "Business personal property", value: "$620,000 blanket", confidence: "high", status: "confirmed", page: 3 },
    { label: "Business income", value: "Actual loss sustained, 12 months", confidence: "medium", status: "confirmed", page: 18 },
    { label: "Equipment breakdown sublimit", value: "$50,000 per breakdown", confidence: "high", status: "limitation", page: 41, bbox: JSON.stringify(bop.bboxes["bop-eb"]) },
    { label: "GL each-occurrence limit", value: "$1,000,000 / $2,000,000 agg.", confidence: "high", status: "confirmed", page: 22 },
    { label: "Property deductible", value: "$2,500", confidence: "high", status: "confirmed", page: 3 },
  ];
  order = 0;
  for (const f of bopFields) {
    await db.extractedField.create({ data: { documentId: d2.id, order: order++, ...f } });
  }

  const d3 = await mkDoc({
    name: "Workers' Compensation Policy", type: "Workers' comp", carrier: "Pinnacle State Fund",
    pages: 10, completeness: "Missing pages", status: "extracted",
    filePath: "data/uploads/lakeview-workers-comp.pdf", fieldsTotal: 4,
  });
  const wcFields = [
    { label: "Employers liability limits", value: "$500k / $500k / $500k", confidence: "high", status: "confirmed", page: 2 },
    { label: "Classification codes", value: "Schedule pages 11–15 not in upload", confidence: "low", status: "missing-info", page: 11 },
    { label: "Estimated annual payroll", value: "Not determinable from upload", confidence: "low", status: "missing-info", page: 12 },
    { label: "State coverage", value: "Illinois", confidence: "high", status: "confirmed", page: 1 },
  ];
  order = 0;
  for (const f of wcFields) {
    await db.extractedField.create({ data: { documentId: d3.id, order: order++, ...f } });
  }

  const d4 = await mkDoc({
    name: "Cyber Liability Declarations", type: "Cyber / data breach", carrier: "Meridian Assurance",
    pages: 6, completeness: "Partial", status: "extracted",
    filePath: "data/uploads/lakeview-cyber-dec.pdf", fieldsTotal: 4,
  });
  const cyFields = [
    { label: "Aggregate limit", value: "$250,000", confidence: "high", status: "limitation", page: 1, bbox: JSON.stringify(cyber.bboxes["cy-agg"]) },
    { label: "Ransomware sublimit", value: "$100,000", confidence: "high", status: "limitation", page: 1 },
    { label: "Social engineering sublimit", value: "$25,000", confidence: "medium", status: "limitation", page: 1 },
    { label: "Full policy form", value: "Declarations only — form not provided", confidence: "low", status: "missing-info", page: 1 },
  ];
  order = 0;
  for (const f of cyFields) {
    await db.extractedField.create({ data: { documentId: d4.id, order: order++, ...f } });
  }

  await mkDoc({
    name: "Umbrella Policy", type: "Commercial umbrella", carrier: "—",
    pages: 0, completeness: "Not received", status: "none", fieldsTotal: 0,
  });

  // ── Analyses + findings ────────────────────────────────────────
  const stageByPractice: Record<string, { stage: string; progress: number; analyst: string }> = {};
  for (const a of gapAnalyses) {
    const pid = practices.find((p) => p.name === a.practice)?.id;
    if (pid) stageByPractice[pid] = { stage: a.stage, progress: a.progress, analyst: a.analyst };
  }
  const analysisIds: Record<string, string> = {};
  for (const [pid, meta] of Object.entries(stageByPractice)) {
    const row = await db.analysis.create({
      data: {
        practiceId: practiceIds[pid], stage: meta.stage, progress: meta.progress,
        analystName: meta.analyst === "M. Okafor" ? "Maya Okafor" : meta.analyst === "J. Whitfield" ? "Jordan Whitfield" : "Rafael Castellanos",
      },
    });
    analysisIds[pid] = row.id;
  }

  // Lakeview findings: most approved, two still proposed to demo the queue.
  order = 0;
  for (const f of findings) {
    await db.finding.create({
      data: {
        analysisId: analysisIds["p1"], severity: f.severity, status: f.status,
        title: f.title, detail: f.detail, source: f.source, ruleCode: f.rule ?? null,
        state: f.id === "g4" || f.id === "g5" ? "PROPOSED" : "APPROVED",
        order: order++,
      },
    });
  }

  console.log("Seed complete:",
    await db.user.count(), "users,",
    await db.practice.count(), "practices,",
    await db.document.count(), "documents,",
    await db.extractedField.count(), "fields,",
    await db.finding.count(), "findings");
}

main().finally(() => db.$disconnect());
