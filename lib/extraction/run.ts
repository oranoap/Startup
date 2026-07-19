import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "../db";
import { getProvider } from "./provider";
import { runRulesForPractice } from "../rules-engine";

/**
 * Runs extraction for an uploaded document: reads the PDF, calls the
 * configured provider (Claude when ANTHROPIC_API_KEY is set, mock otherwise),
 * persists the extracted fields, appends provider-proposed findings, then
 * runs the deterministic rules engine over the practice.
 */
export async function runExtraction(documentId: string) {
  const doc = await db.document.findUnique({
    where: { id: documentId },
    include: { practice: { include: { analyses: true } } },
  });
  if (!doc || !doc.filePath) throw new Error("Document has no file");

  await db.document.update({
    where: { id: doc.id },
    data: { status: "extracting" },
  });

  try {
    const pdf = await readFile(path.join(process.cwd(), doc.filePath));
    const rules = await db.rule.findMany({ where: { enabled: true } });
    const provider = await getProvider();

    const result = await provider.extract({
      pdf,
      documentName: doc.name,
      documentType: doc.type,
      practiceName: doc.practice.name,
      practiceProfile: doc.practice.profile,
      rules: rules.map((r) => ({
        code: r.code,
        title: r.title,
        severity: r.severity,
        trigger: r.trigger,
        description: r.description,
      })),
    });

    await db.extractedField.deleteMany({ where: { documentId: doc.id } });
    let order = 0;
    for (const f of result.fields) {
      await db.extractedField.create({
        data: {
          documentId: doc.id,
          label: f.label,
          value: f.value,
          confidence: f.confidence,
          status: f.status,
          page: Math.max(1, f.page),
          sourceText: f.source_text,
          order: order++,
        },
      });
    }

    await db.document.update({
      where: { id: doc.id },
      data: {
        status: "extracted",
        fieldsTotal: result.fields.length,
        completeness: /missing|not supplied|not provided|declarations only/i.test(
          result.completeness_note
        )
          ? "Partial"
          : "Complete",
      },
    });

    // Provider-proposed findings (Claude path) enter as PROPOSED, subject to
    // the same low-confidence demotion the rules engine applies.
    const analysis = doc.practice.analyses[0];
    if (analysis) {
      const existing = await db.finding.findMany({
        where: { analysisId: analysis.id },
        select: { ruleCode: true, title: true },
      });
      const existingCodes = new Set(existing.map((f) => f.ruleCode).filter(Boolean));
      const existingTitles = new Set(existing.map((f) => f.title.toLowerCase()));
      let fOrder = 200;
      for (const finding of result.findings) {
        // Dedupe: skip findings whose rule already produced one on this
        // analysis, or whose title matches an existing finding.
        if (
          (finding.analysis_rule_applied &&
            existingCodes.has(finding.analysis_rule_applied)) ||
          existingTitles.has(finding.title.toLowerCase())
        )
          continue;
        const severity =
          finding.confidence === "low" &&
          (finding.severity === "Critical" || finding.severity === "Important")
            ? "Clarification"
            : finding.severity;
        await db.finding.create({
          data: {
            analysisId: analysis.id,
            severity,
            status: finding.status,
            title: finding.title,
            detail: `${finding.explanation} Recommended next action: ${finding.recommended_next_action}${finding.information_still_needed ? ` Information still needed: ${finding.information_still_needed}` : ""}`,
            source: finding.source_citations,
            ruleCode: finding.analysis_rule_applied,
            state: "PROPOSED",
            order: fOrder++,
          },
        });
      }
    }

    await runRulesForPractice(doc.practiceId);
    return { ok: true as const, provider: provider.name };
  } catch (err) {
    await db.document.update({
      where: { id: doc.id },
      data: { status: "failed" },
    });
    throw err;
  }
}
