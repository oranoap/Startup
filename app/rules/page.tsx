import { db } from "@/lib/db";
import { Card, SeverityBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function RulesPage() {
  const rules = await db.rule.findMany({ orderBy: { code: "asc" } });
  const proposed90d = await db.finding.count({ where: { ruleCode: { not: null } } });
  const acceptedCount = await db.finding.count({
    where: { ruleCode: { not: null }, state: "APPROVED" },
  });
  const decidedCount = await db.finding.count({
    where: { ruleCode: { not: null }, state: { in: ["APPROVED", "DISMISSED"] } },
  });
  const acceptance =
    decidedCount === 0 ? 100 : Math.round((acceptedCount / decidedCount) * 100);

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Analysis rules
          </h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-faint">
            Rules compare extracted policy fields against the practice profile
            and propose findings. Every proposed finding still requires analyst
            approval and licensed-agent sign-off — rules never publish directly
            to a report.
          </p>
        </div>
        <button
          type="button"
          className="h-8 shrink-0 rounded-md bg-brand-700 px-3.5 text-[13px] font-medium text-white hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          New rule
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          [String(rules.filter((r) => r.enabled).length), "Active rules"],
          [String(rules.filter((r) => !r.enabled).length), "Disabled rules"],
          [String(proposed90d), "Rule-linked findings"],
          [`${acceptance}%`, "Analyst acceptance rate"],
        ].map(([v, l]) => (
          <Card key={l} className="px-5 py-4">
            <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              {l}
            </p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums text-ink">{v}</p>
          </Card>
        ))}
      </div>

      <Card>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              <th className="px-5 py-3 font-medium">Rule</th>
              <th className="px-3 py-3 font-medium">Trigger condition</th>
              <th className="px-3 py-3 font-medium">Severity</th>
              <th className="px-3 py-3 text-right font-medium">Total firings</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-paper/70">
                <td className="px-5 py-3.5">
                  <p className="text-2xs font-semibold tabular-nums text-brand-700">
                    {r.code}
                  </p>
                  <p className="mt-0.5 text-[13px] font-medium text-ink">{r.title}</p>
                  <p className="mt-0.5 text-2xs text-ink-faint">{r.category}</p>
                </td>
                <td className="px-3 py-3.5">
                  <code className="rounded bg-paper px-2 py-1 font-mono text-2xs text-ink-soft ring-1 ring-inset ring-line">
                    {r.trigger}
                  </code>
                </td>
                <td className="px-3 py-3.5">
                  <SeverityBadge
                    severity={r.severity as "Critical" | "Important" | "Advisory"}
                  />
                </td>
                <td className="px-3 py-3.5 text-right text-xs tabular-nums text-ink-soft">
                  {r.firings}
                </td>
                <td className="px-3 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-2xs font-medium ${
                      r.enabled ? "text-emerald-700" : "text-ink-faint"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${r.enabled ? "bg-emerald-600" : "bg-slate-400"}`}
                    />
                    {r.enabled ? "Active" : "Disabled"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
