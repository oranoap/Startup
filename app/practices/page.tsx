import Link from "next/link";
import { db } from "@/lib/db";
import { Card, ProgressBar } from "@/components/ui";
import { IconChevronRight } from "@/components/icons";

export const dynamic = "force-dynamic";

const stageCls: Record<string, string> = {
  Extraction: "bg-slate-100 text-slate-700 ring-slate-500/20",
  "Field review": "bg-blue-50 text-blue-800 ring-blue-600/20",
  "Findings review": "bg-amber-50 text-amber-900 ring-amber-600/25",
  "Report drafted": "bg-violet-50 text-violet-800 ring-violet-600/20",
  Delivered: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
};

export default async function PracticesPage() {
  const practices = await db.practice.findMany({
    orderBy: { updatedAt: "desc" },
    include: { analyses: true },
  });

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Client practices
          </h2>
          <p className="mt-0.5 text-xs text-ink-faint">
            {practices.length} practices ·{" "}
            {practices.filter((p) => p.analyses[0] && p.analyses[0].stage !== "Delivered").length}{" "}
            with active analyses
          </p>
        </div>
        <button
          type="button"
          className="h-8 rounded-md bg-brand-700 px-3.5 text-[13px] font-medium text-white hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Add practice
        </button>
      </div>

      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              <th className="px-5 py-3 font-medium">Practice</th>
              <th className="px-3 py-3 font-medium">Specialty</th>
              <th className="px-3 py-3 text-center font-medium">Dentists</th>
              <th className="px-3 py-3 text-center font-medium">Locations</th>
              <th className="px-3 py-3 font-medium">Broker</th>
              <th className="px-3 py-3 font-medium">Analysis stage</th>
              <th className="w-40 px-3 py-3 font-medium">Progress</th>
              <th className="w-10 px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {practices.map((p) => {
              const a = p.analyses[0];
              return (
                <tr key={p.id} className="hover:bg-paper/70">
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-medium text-ink">{p.name}</p>
                    <p className="mt-0.5 text-2xs text-ink-faint">{p.location}</p>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-ink-soft">{p.specialty}</td>
                  <td className="px-3 py-3.5 text-center text-xs tabular-nums text-ink-soft">
                    {p.dentists}
                  </td>
                  <td className="px-3 py-3.5 text-center text-xs tabular-nums text-ink-soft">
                    {p.locations}
                  </td>
                  <td className="px-3 py-3.5 text-xs text-ink-soft">{p.broker}</td>
                  <td className="px-3 py-3.5">
                    {a ? (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-medium ring-1 ring-inset ${stageCls[a.stage] ?? stageCls.Extraction}`}
                      >
                        {a.stage}
                      </span>
                    ) : (
                      <span className="text-2xs text-ink-faint">No analysis</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    {a && <ProgressBar value={a.progress} label={`${p.name} progress`} />}
                  </td>
                  <td className="px-3 py-3.5">
                    <Link
                      href="/review"
                      aria-label={`Open ${p.name}`}
                      className="inline-flex rounded p-1 text-ink-faint hover:bg-slate-100 hover:text-ink"
                    >
                      <IconChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
