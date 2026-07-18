import { Card, SeverityBadge } from "@/components/ui";
import { riskRules } from "@/lib/data";

const ruleRows = [
  ...riskRules.map((r) => ({
    ...r,
    trigger:
      r.code === "PL-014"
        ? "sedation_services = true AND anesthesia_coverage = excluded"
        : r.code === "PL-006"
          ? "coverage_form = claims-made AND tail_provision = not_found"
          : r.code === "PL-021"
            ? "treating_dentists > named_insureds"
            : r.code === "BOP-load"
              ? "equipment_value > breakdown_sublimit × 1.5"
              : r.code === "CY-002"
                ? "patient_records × $110 > cyber_aggregate"
                : "class_code NOT IN dental_codes",
    enabled: true,
    firings: r.code === "PL-014" ? 41 : r.code === "PL-006" ? 87 : r.code === "PL-021" ? 29 : r.code === "BOP-load" ? 63 : r.code === "CY-002" ? 118 : 12,
  })),
];

export default function RulesPage() {
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
          ["102", "Active rules"],
          ["6", "Draft rules"],
          ["350", "Findings proposed, 90 days"],
          ["94%", "Analyst acceptance rate"],
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
              <th className="px-3 py-3 text-right font-medium">Firings, 90d</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ruleRows.map((r) => (
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
                  <SeverityBadge severity={r.severity} />
                </td>
                <td className="px-3 py-3.5 text-right text-xs tabular-nums text-ink-soft">
                  {r.firings}
                </td>
                <td className="px-3 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Active
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
