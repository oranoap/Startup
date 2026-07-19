import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  Card,
  CardHeader,
  ProgressBar,
  SeverityBadge,
  StatusBadge,
} from "@/components/ui";
import {
  ExportPdfButton,
  FindingStateButtons,
  SignOffButton,
} from "@/components/reports/ReportControls";
import { IconChevronRight } from "@/components/icons";
import type { Status } from "@/lib/data";

export const dynamic = "force-dynamic";

const CATEGORY_BY_PREFIX: [RegExp, string][] = [
  [/^PL/, "Professional liability"],
  [/^BOP/, "Property & BOP"],
  [/^CY/, "Cyber"],
  [/^WC/, "Workers' compensation"],
];

function categoryOf(ruleCode: string | null, source: string): string {
  if (ruleCode) {
    for (const [re, cat] of CATEGORY_BY_PREFIX) if (re.test(ruleCode)) return cat;
  }
  if (/cyber/i.test(source)) return "Cyber";
  if (/workers/i.test(source)) return "Workers' compensation";
  if (/business owners|bop/i.test(source)) return "Property & BOP";
  return "Professional liability";
}

function gradeFor(critical: number, important: number, strengths: number, hasData: boolean) {
  if (!hasData) return "—";
  const score = 10 - critical * 3 - important * 1.5 + Math.min(strengths, 3) * 0.5;
  if (score >= 10) return "A";
  if (score >= 8.5) return "A−";
  if (score >= 7.5) return "B+";
  if (score >= 6.5) return "B";
  if (score >= 5.5) return "B−";
  if (score >= 4.5) return "C+";
  if (score >= 3.5) return "C";
  return "C−";
}

export default async function ReportsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const practice = await db.practice.findFirst({
    orderBy: { updatedAt: "desc" },
    where: { analyses: { some: {} }, documents: { some: {} } },
    include: {
      documents: { orderBy: { createdAt: "asc" } },
      analyses: { include: { findings: { orderBy: { order: "asc" } } } },
    },
  });
  const analysis = practice?.analyses[0];
  if (!practice || !analysis) {
    return (
      <p className="p-10 text-center text-sm text-ink-faint">
        No analyses yet. Seed the database with <code>npm run db:seed</code>.
      </p>
    );
  }

  const approved = analysis.findings.filter((f) => f.state === "APPROVED");
  const proposed = analysis.findings.filter((f) => f.state === "PROPOSED");
  const critical = approved.filter((f) => f.severity === "Critical");
  const important = approved.filter((f) => f.severity === "Important");
  const clarifications = approved.filter((f) => f.severity === "Clarification");
  const strengths = approved.filter((f) => f.severity === "Strength");

  const fieldStats = await db.extractedField.aggregate({
    where: { document: { practiceId: practice.id } },
    _count: { _all: true },
  });
  const reviewedCount = await db.extractedField.count({
    where: { document: { practiceId: practice.id }, decision: { not: null } },
  });
  const progress =
    fieldStats._count._all === 0
      ? 0
      : Math.round((reviewedCount / fieldStats._count._all) * 100);

  const categories = ["Professional liability", "Property & BOP", "Cyber", "Workers' compensation"].map(
    (cat) => {
      const inCat = approved.filter((f) => categoryOf(f.ruleCode, f.source) === cat);
      const c = inCat.filter((f) => f.severity === "Critical").length;
      const i = inCat.filter((f) => f.severity === "Important").length;
      const s = inCat.filter((f) => f.severity === "Strength").length;
      const hasData =
        inCat.length > 0 &&
        !(cat === "Workers' compensation" &&
          practice.documents.some(
            (d) => /workers/i.test(d.name) && d.completeness !== "Complete"
          ));
      return { name: cat, counts: { critical: c, important: i, strengths: s }, grade: gradeFor(c, i, s, hasData) };
    }
  );

  const agentSteps = [
    { step: "Field extraction verified", who: analysis.analystName, state: progress > 50 ? "done" : "current" },
    { step: "Findings reviewed & edited", who: analysis.analystName, state: proposed.length === 0 ? "done" : "current" },
    { step: "Licensed agent sign-off", who: analysis.signedOffBy ?? "Dana Reyes, CIC", state: analysis.signedOffAt ? "done" : "current" },
    { step: "Report released to client", who: "—", state: analysis.signedOffAt ? "current" : "todo" },
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xs font-medium uppercase tracking-[0.12em] text-ink-faint">
            Gap-analysis report ·{" "}
            {analysis.signedOffAt ? "Signed off" : "In review"}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
            {practice.name}
          </h2>
          <p className="mt-1 text-xs text-ink-faint">
            {practice.location} · {practice.dentists} dentists · Analyst:{" "}
            {analysis.analystName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/reports/preview"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 text-[13px] font-medium text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            Preview executive report <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
          <ExportPdfButton analysisId={analysis.id} enabled={!!analysis.signedOffAt} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Critical findings", n: critical.length, cls: "border-l-red-500", sub: "Immediate action recommended" },
          { label: "Important findings", n: important.length, cls: "border-l-amber-500", sub: "Address at or before renewal" },
          { label: "Clarifications needed", n: clarifications.length, cls: "border-l-blue-500", sub: "Awaiting client or carrier response" },
          { label: "Coverage strengths", n: strengths.length, cls: "border-l-emerald-500", sub: "Worth preserving at renewal" },
        ].map((t) => (
          <Card key={t.label} className={`border-l-2 px-5 py-4 ${t.cls}`}>
            <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              {t.label}
            </p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">{t.n}</p>
            <p className="mt-0.5 text-2xs text-ink-faint">{t.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {proposed.length > 0 && (
            <Card className="border-brand-600/30">
              <CardHeader
                title={`Proposed findings awaiting review (${proposed.length})`}
                subtitle="Proposed by extraction and rules — approve to include in the report, dismiss to discard"
              />
              <ul className="divide-y divide-line">
                {proposed.map((f) => (
                  <li key={f.id} className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={f.severity as "Critical" | "Important" | "Clarification" | "Strength"} />
                      <StatusBadge status={f.status as Status} />
                      {f.ruleCode && (
                        <span className="ml-auto text-2xs font-medium tabular-nums text-brand-700">
                          Rule {f.ruleCode}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[13px] font-semibold text-ink">{f.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{f.detail}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-2xs text-ink-faint">{f.source}</p>
                      <FindingStateButtons findingId={f.id} />
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Findings in report"
              subtitle="Every finding cites the policy language it is based on"
            />
            <ul className="divide-y divide-line">
              {approved.map((f) => (
                <li key={f.id} className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={f.severity as "Critical" | "Important" | "Clarification" | "Strength"} />
                    <StatusBadge status={f.status as Status} />
                    {f.ruleCode && (
                      <span className="ml-auto text-2xs font-medium tabular-nums text-brand-700">
                        Rule {f.ruleCode}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] font-semibold text-ink">{f.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">{f.detail}</p>
                  <p className="mt-1.5 text-2xs text-ink-faint">{f.source}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Category assessment"
              subtitle="Grades are directional and always read with the findings"
            />
            <ul className="divide-y divide-line">
              {categories.map((c) => (
                <li key={c.name} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-ink">{c.name}</p>
                    <span className="rounded-md bg-paper px-2 py-0.5 font-serif text-sm font-semibold text-ink ring-1 ring-inset ring-line">
                      {c.grade}
                    </span>
                  </div>
                  <p className="mt-1.5 flex gap-2 text-2xs font-medium">
                    {c.counts.critical > 0 && (
                      <span className="text-red-700">{c.counts.critical} critical</span>
                    )}
                    {c.counts.important > 0 && (
                      <span className="text-amber-700">{c.counts.important} important</span>
                    )}
                    {c.counts.strengths > 0 && (
                      <span className="text-emerald-700">{c.counts.strengths} strengths</span>
                    )}
                    {c.grade === "—" && (
                      <span className="text-ink-faint">
                        Not gradable until missing documents arrive
                      </span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Policies & documents reviewed" />
            <ul className="divide-y divide-line">
              {practice.documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-5 py-2.5">
                  <div>
                    <p className="text-xs font-medium text-ink">{d.name}</p>
                    <p className="text-2xs text-ink-faint">{d.carrier}</p>
                  </div>
                  <span
                    className={`text-2xs font-medium ${
                      d.completeness === "Complete"
                        ? "text-emerald-700"
                        : d.completeness === "Not received"
                          ? "text-red-700"
                          : "text-amber-700"
                    }`}
                  >
                    {d.completeness}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Analysis progress" />
            <div className="px-5 py-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs text-ink-soft">Field review</p>
                <p className="text-xs font-semibold tabular-nums text-ink">{progress}%</p>
              </div>
              <ProgressBar value={progress} label="Analysis progress" className="mt-1.5" />
              <p className="mt-2 text-2xs text-ink-faint">
                {reviewedCount} of {fieldStats._count._all} extracted fields reviewed ·{" "}
                {proposed.length} findings awaiting review
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Agent review status"
              action={
                <SignOffButton
                  analysisId={analysis.id}
                  signedOff={!!analysis.signedOffAt}
                  canSignOff={role === "AGENT" || role === "ADMIN"}
                />
              }
            />
            <ol className="px-5 py-4">
              {agentSteps.map((s, i) => (
                <li key={s.step} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < agentSteps.length - 1 && (
                    <span className="absolute left-[7px] top-5 h-full w-px bg-line" aria-hidden="true" />
                  )}
                  <span
                    aria-hidden="true"
                    className={`relative mt-0.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full ring-2 ${
                      s.state === "done"
                        ? "bg-brand-600 ring-brand-600"
                        : s.state === "current"
                          ? "bg-white ring-brand-600"
                          : "bg-white ring-line"
                    }`}
                  >
                    {s.state === "done" && (
                      <svg viewBox="0 0 10 10" className="h-2 w-2" fill="none">
                        <path d="m2 5.2 2 2 4-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    )}
                    {s.state === "current" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    )}
                  </span>
                  <div>
                    <p className={`text-xs font-medium ${s.state === "todo" ? "text-ink-faint" : "text-ink"}`}>
                      {s.step}
                    </p>
                    <p className="text-2xs text-ink-faint">{s.who}</p>
                  </div>
                </li>
              ))}
            </ol>
            {analysis.signedOffAt && (
              <p className="border-t border-line px-5 py-3 text-2xs text-ink-faint">
                Signed off by {analysis.signedOffBy} on{" "}
                {analysis.signedOffAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                .
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
