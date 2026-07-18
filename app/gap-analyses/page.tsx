import Link from "next/link";
import { Card, ProgressBar } from "@/components/ui";
import { gapAnalyses } from "@/lib/data";
import { IconChevronRight } from "@/components/icons";

const stageCls: Record<string, string> = {
  Extraction: "bg-slate-100 text-slate-700 ring-slate-500/20",
  "Field review": "bg-blue-50 text-blue-800 ring-blue-600/20",
  "Findings review": "bg-amber-50 text-amber-900 ring-amber-600/25",
  "Report drafted": "bg-violet-50 text-violet-800 ring-violet-600/20",
  Delivered: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
};

const pipeline = [
  { stage: "Extraction", count: 1 },
  { stage: "Field review", count: 1 },
  { stage: "Findings review", count: 1 },
  { stage: "Report drafted", count: 1 },
  { stage: "Delivered", count: 1 },
];

export default function GapAnalysesPage() {
  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Gap analyses
          </h2>
          <p className="mt-0.5 text-xs text-ink-faint">
            Each analysis moves through extraction, human field review, findings
            review and agent sign-off before a report is produced.
          </p>
        </div>
        <button
          type="button"
          className="h-8 rounded-md bg-brand-700 px-3.5 text-[13px] font-medium text-white hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          New analysis
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {pipeline.map((p) => (
          <Card key={p.stage} className="px-4 py-3">
            <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              {p.stage}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
              {p.count}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              <th className="px-5 py-3 font-medium">Practice</th>
              <th className="px-3 py-3 text-center font-medium">Documents</th>
              <th className="px-3 py-3 font-medium">Findings so far</th>
              <th className="px-3 py-3 font-medium">Stage</th>
              <th className="w-40 px-3 py-3 font-medium">Progress</th>
              <th className="px-3 py-3 font-medium">Analyst</th>
              <th className="px-3 py-3 font-medium">Updated</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {gapAnalyses.map((a) => (
              <tr key={a.id} className="hover:bg-paper/70">
                <td className="px-5 py-3.5 text-[13px] font-medium text-ink">
                  {a.practice}
                </td>
                <td className="px-3 py-3.5 text-center text-xs tabular-nums text-ink-soft">
                  {a.documents} / {a.policies}
                </td>
                <td className="px-3 py-3.5">
                  <span className="flex items-center gap-1.5 text-2xs font-medium">
                    {a.critical > 0 && (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-800 ring-1 ring-inset ring-red-600/20">
                        {a.critical} critical
                      </span>
                    )}
                    {a.important > 0 && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-900 ring-1 ring-inset ring-amber-600/25">
                        {a.important} important
                      </span>
                    )}
                    {a.clarifications > 0 && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-800 ring-1 ring-inset ring-blue-600/20">
                        {a.clarifications} to clarify
                      </span>
                    )}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-medium ring-1 ring-inset ${stageCls[a.stage]}`}
                  >
                    {a.stage}
                  </span>
                </td>
                <td className="px-3 py-3.5">
                  <ProgressBar value={a.progress} label={`${a.practice} progress`} />
                </td>
                <td className="px-3 py-3.5 text-xs text-ink-soft">{a.analyst}</td>
                <td className="px-3 py-3.5 text-2xs text-ink-faint">{a.updated}</td>
                <td className="px-3 py-3.5">
                  <Link
                    href="/reports"
                    aria-label={`Open analysis for ${a.practice}`}
                    className="inline-flex rounded p-1 text-ink-faint hover:bg-slate-100 hover:text-ink"
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
