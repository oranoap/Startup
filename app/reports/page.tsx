import Link from "next/link";
import {
  Card,
  CardHeader,
  ProgressBar,
  SeverityBadge,
  StatusBadge,
} from "@/components/ui";
import { documents, findings } from "@/lib/data";
import { IconDownload, IconChevronRight } from "@/components/icons";

const categories = [
  {
    name: "Professional liability",
    score: "B−",
    note: "Strong limits and consent terms, undermined by the sedation exclusion and unlisted associates.",
    counts: { critical: 2, important: 1, strengths: 3 },
  },
  {
    name: "Property & BOP",
    score: "B",
    note: "Solid base form; equipment-breakdown sublimit is the outlier for a CAD/CAM practice.",
    counts: { critical: 0, important: 1, strengths: 1 },
  },
  {
    name: "Cyber",
    score: "C+",
    note: "Coverage exists but limits lag the practice's PHI footprint; declarations incomplete.",
    counts: { critical: 0, important: 1, strengths: 0 },
  },
  {
    name: "Workers' comp",
    score: "—",
    note: "Cannot be graded until the missing classification and payroll schedule is received.",
    counts: { critical: 0, important: 0, strengths: 0 },
  },
];

const agentReview = [
  { step: "Field extraction verified", who: "M. Okafor", state: "done" as const },
  { step: "Findings reviewed & edited", who: "M. Okafor", state: "done" as const },
  { step: "Licensed agent sign-off", who: "D. Reyes, CIC", state: "current" as const },
  { step: "Report released to client", who: "—", state: "todo" as const },
];

export default function ReportsPage() {
  const critical = findings.filter((f) => f.severity === "Critical");
  const important = findings.filter((f) => f.severity === "Important");
  const clarifications = findings.filter((f) => f.severity === "Clarification");
  const strengths = findings.filter((f) => f.severity === "Strength");

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xs font-medium uppercase tracking-[0.12em] text-ink-faint">
            Gap-analysis report · In agent review
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
            Lakeview Family Dental
          </h2>
          <p className="mt-1 text-xs text-ink-faint">
            Naperville & Aurora, IL · 4 dentists · Policy period reviewed:
            2025–2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/reports/preview"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3.5 text-[13px] font-medium text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            Preview executive report <IconChevronRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-700 px-3.5 text-[13px] font-medium text-white hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <IconDownload className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-2 border-l-red-500 px-5 py-4">
          <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
            Critical findings
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">
            {critical.length}
          </p>
          <p className="mt-0.5 text-2xs text-ink-faint">
            Immediate action recommended
          </p>
        </Card>
        <Card className="border-l-2 border-l-amber-500 px-5 py-4">
          <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
            Important findings
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">
            {important.length}
          </p>
          <p className="mt-0.5 text-2xs text-ink-faint">
            Address at or before renewal
          </p>
        </Card>
        <Card className="border-l-2 border-l-blue-500 px-5 py-4">
          <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
            Clarifications needed
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">
            {clarifications.length}
          </p>
          <p className="mt-0.5 text-2xs text-ink-faint">
            Awaiting client or carrier response
          </p>
        </Card>
        <Card className="border-l-2 border-l-emerald-500 px-5 py-4">
          <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
            Coverage strengths
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">
            {strengths.length}
          </p>
          <p className="mt-0.5 text-2xs text-ink-faint">
            Worth preserving at renewal
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Findings list */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Findings"
              subtitle="Every finding cites the policy language it is based on"
            />
            <ul className="divide-y divide-line">
              {findings.map((f) => (
                <li key={f.id} className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={f.severity} />
                    <StatusBadge status={f.status} />
                    {f.rule && (
                      <span className="ml-auto text-2xs font-medium tabular-nums text-brand-700">
                        Rule {f.rule}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] font-semibold text-ink">
                    {f.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                    {f.detail}
                  </p>
                  <p className="mt-1.5 text-2xs text-ink-faint">{f.source}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right rail */}
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
                      {c.score}
                    </span>
                  </div>
                  <p className="mt-1 text-2xs leading-relaxed text-ink-faint">
                    {c.note}
                  </p>
                  <p className="mt-1.5 flex gap-2 text-2xs font-medium">
                    {c.counts.critical > 0 && (
                      <span className="text-red-700">{c.counts.critical} critical</span>
                    )}
                    {c.counts.important > 0 && (
                      <span className="text-amber-700">
                        {c.counts.important} important
                      </span>
                    )}
                    {c.counts.strengths > 0 && (
                      <span className="text-emerald-700">
                        {c.counts.strengths} strengths
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
              {documents.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between px-5 py-2.5"
                >
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
                <p className="text-xs text-ink-soft">Overall</p>
                <p className="text-xs font-semibold tabular-nums text-ink">68%</p>
              </div>
              <ProgressBar value={68} label="Analysis progress" className="mt-1.5" />
              <p className="mt-2 text-2xs text-ink-faint">
                56 of 78 fields reviewed · 2 documents outstanding
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader title="Agent review status" />
            <ol className="px-5 py-4">
              {agentReview.map((s, i) => (
                <li key={s.step} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < agentReview.length - 1 && (
                    <span
                      className="absolute left-[7px] top-5 h-full w-px bg-line"
                      aria-hidden="true"
                    />
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
                        <path
                          d="m2 5.2 2 2 4-4.5"
                          stroke="#fff"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    {s.state === "current" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    )}
                  </span>
                  <div>
                    <p
                      className={`text-xs font-medium ${
                        s.state === "todo" ? "text-ink-faint" : "text-ink"
                      }`}
                    >
                      {s.step}
                    </p>
                    <p className="text-2xs text-ink-faint">{s.who}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
