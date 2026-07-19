import { db } from "@/lib/db";
import {
  ReviewWorkspace,
  type DocumentData,
  type ProposedFindingData,
  type RuleData,
} from "@/components/review/ReviewWorkspace";
import type { Confidence, Status } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  // v1 scopes the workspace to the practice with the most recent activity.
  const practice = await db.practice.findFirst({
    orderBy: { updatedAt: "desc" },
    where: { documents: { some: {} } },
    include: {
      documents: {
        orderBy: { createdAt: "asc" },
        include: { fields: { orderBy: { order: "asc" } } },
      },
      analyses: {
        include: {
          findings: { where: { state: "PROPOSED" }, orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!practice) {
    return (
      <p className="p-10 text-center text-sm text-ink-faint">
        No practices with documents yet. Seed the database with{" "}
        <code>npm run db:seed</code>.
      </p>
    );
  }

  const rules = await db.rule.findMany({ where: { enabled: true } });

  const documents: DocumentData[] = practice.documents.map((d) => ({
    id: d.id,
    name: d.name,
    type: d.type,
    carrier: d.carrier,
    pages: d.pages,
    completeness: d.completeness,
    status: d.status,
    hasFile: !!d.filePath,
    fields: d.fields.map((f) => ({
      id: f.id,
      label: f.label,
      value: f.value,
      confidence: f.confidence as Confidence,
      status: f.status as Status,
      page: f.page,
      decision: f.decision as "approved" | "edited" | "rejected" | null,
      bbox: f.bbox ? JSON.parse(f.bbox) : null,
      sourceText: f.sourceText,
    })),
  }));

  const proposedFindings: ProposedFindingData[] =
    practice.analyses[0]?.findings.map((f) => ({
      id: f.id,
      title: f.title,
      detail: f.detail,
      severity: f.severity,
      status: f.status as Status,
      source: f.source,
      ruleCode: f.ruleCode,
    })) ?? [];

  return (
    <ReviewWorkspace
      practice={{ id: practice.id, name: practice.name }}
      documents={documents}
      rules={rules.map(
        (r): RuleData => ({
          code: r.code,
          title: r.title,
          severity: r.severity as RuleData["severity"],
          description: r.description,
        })
      )}
      proposedFindings={proposedFindings}
    />
  );
}
