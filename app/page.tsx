import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Card, CardHeader, ProgressBar, SeverityBadge, StatusBadge } from "@/components/ui";
import { IconUpload, IconChevronRight } from "@/components/icons";
import type { Status } from "@/lib/data";

export const dynamic = "force-dynamic";

const activity = [
  { time: "9:41 AM", text: "Extraction completed for Lakeview Family Dental — Cyber Liability Declarations (declarations only, form missing)." },
  { time: "8:15 AM", text: "Jordan Whitfield approved 14 extracted fields for Summit Oral Surgery Associates." },
  { time: "Yesterday", text: "Report delivered to Prairie Endodontics Group — 1 critical, 2 important findings." },
  { time: "Yesterday", text: "Document request sent to Harborview Pediatric Dentistry (umbrella policy, workers' comp schedule)." },
];

export default async function Dashboard() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const [activeAnalyses, awaitingDocs, proposedFindings, criticalProposed, delivered, analyses, pendingFindings] =
    await Promise.all([
      db.analysis.count({ where: { stage: { not: "Delivered" } } }),
      db.document.count({ where: { completeness: "Not received" } }),
      db.finding.count({ where: { state: "PROPOSED" } }),
      db.finding.count({ where: { state: "PROPOSED", severity: "Critical" } }),
      db.analysis.count({ where: { stage: "Delivered" } }),
      db.analysis.findMany({
        where: { stage: { not: "Delivered" } },
        orderBy: { updatedAt: "desc" },
        take: 4,
        include: { practice: { include: { documents: true } }, findings: true },
      }),
      db.finding.findMany({
        where: { state: "PROPOSED" },
        orderBy: { order: "asc" },
        take: 4,
        include: { analysis: { include: { practice: true } } },
      }),
    ]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const stats = [
    { label: "Active gap analyses", value: String(activeAnalyses), sub: `${awaitingDocs} document${awaitingDocs === 1 ? "" : "s"} outstanding` },
    { label: "Findings pending review", value: String(proposedFindings), sub: `${criticalProposed} marked critical` },
    { label: "Reports delivered", value: String(delivered), sub: "All time" },
    { label: "Avg. turnaround", value: "4.2 days", sub: "upload to delivered report" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xs font-medium uppercase tracking-[0.12em] text-ink-faint">
            {today}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
            Good morning, {firstName}
          </h2>
        </div>
        <Link
          href="/review"
          className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-3.5 py-2 text-[13px] font-medium text-white shadow-card hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <IconUpload className="h-4 w-4" />
          Upload policy documents
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="px-5 py-4">
            <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{s.value}</p>
            <p className="mt-1 text-2xs text-ink-faint">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader
            title="Analyses in progress"
            subtitle="Sorted by last activity"
            action={
              <Link
                href="/gap-analyses"
                className="inline-flex items-center gap-1 text-2xs font-medium text-brand-700 hover:text-brand-800"
              >
                View all <IconChevronRight className="h-3 w-3" />
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {analyses.map((a) => {
              const critical = a.findings.filter(
                (f) => f.severity === "Critical" && f.state !== "DISMISSED"
              ).length;
              const important = a.findings.filter(
                (f) => f.severity === "Important" && f.state !== "DISMISSED"
              ).length;
              const received = a.practice.documents.filter((d) => d.filePath).length;
              return (
                <li key={a.id}>
                  <Link
                    href="/gap-analyses"
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-paper/70"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">
                        {a.practice.name}
                      </p>
                      <p className="mt-0.5 text-2xs text-ink-faint">
                        {a.stage} · {received} of {a.practice.documents.length} policies
                        received · {a.analystName}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-2xs">
                      {critical > 0 && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 font-semibold text-red-800 ring-1 ring-inset ring-red-600/20">
                          {critical} critical
                        </span>
                      )}
                      {important > 0 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-900 ring-1 ring-inset ring-amber-600/25">
                          {important} important
                        </span>
                      )}
                    </div>
                    <div className="w-32 shrink-0">
                      <ProgressBar value={a.progress} label={`${a.practice.name} progress`} />
                      <p className="mt-1 text-right text-2xs tabular-nums text-ink-faint">
                        {a.progress}%
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Recent activity" />
          <ul className="divide-y divide-line">
            {activity.map((a, i) => (
              <li key={i} className="px-5 py-3">
                <p className="text-2xs font-medium text-ink-faint">{a.time}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{a.text}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Findings awaiting your review"
          subtitle="Proposed by extraction and rules — approve, edit or reject before they enter a report"
          action={
            <Link
              href="/reports"
              className="inline-flex items-center gap-1 text-2xs font-medium text-brand-700 hover:text-brand-800"
            >
              Review findings <IconChevronRight className="h-3 w-3" />
            </Link>
          }
        />
        {pendingFindings.length === 0 ? (
          <p className="px-5 py-6 text-center text-xs text-ink-faint">
            No findings awaiting review — nice work.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
                <th className="px-5 py-2.5 font-medium">Finding</th>
                <th className="w-32 px-3 py-2.5 font-medium">Severity</th>
                <th className="w-48 px-3 py-2.5 font-medium">Status</th>
                <th className="w-64 px-5 py-2.5 font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pendingFindings.map((f) => (
                <tr key={f.id} className="hover:bg-paper/70">
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-medium text-ink">{f.title}</p>
                    <p className="mt-0.5 text-2xs text-ink-faint">
                      {f.analysis.practice.name}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <SeverityBadge
                      severity={f.severity as "Critical" | "Important" | "Clarification" | "Strength"}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={f.status as Status} />
                  </td>
                  <td className="px-5 py-3 text-2xs text-ink-faint">{f.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
