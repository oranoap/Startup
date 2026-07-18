import { Card, SeverityBadge } from "@/components/ui";
import { riskRules } from "@/lib/data";

const categories = [
  { name: "Professional liability", count: 34, desc: "Malpractice terms, sedation, scope of practice, tail coverage, consent clauses." },
  { name: "Property & BOP", count: 22, desc: "Equipment breakdown, business income, sterilization, tenant improvements." },
  { name: "Cyber & privacy", count: 14, desc: "PHI exposure, HIPAA penalties, ransomware, patient notification." },
  { name: "Workers' compensation", count: 11, desc: "Class codes, ergonomic injury, part-time staff, owner inclusion." },
  { name: "Employment practices", count: 9, desc: "EPLI, wage-and-hour, third-party harassment by patients." },
  { name: "Life, disability & buy-sell", count: 12, desc: "Own-occupation disability, overhead expense, partner buy-sell funding." },
];

const articles = [
  {
    title: "Why IV sedation exclusions are the most expensive fine print in dentistry",
    tag: "Professional liability",
    read: "6 min read",
    updated: "Updated Jun 2026",
  },
  {
    title: "Claims-made vs. occurrence for dental malpractice: what actually matters",
    tag: "Professional liability",
    read: "8 min read",
    updated: "Updated May 2026",
  },
  {
    title: "Pricing PHI risk: cyber limits benchmarks by practice size",
    tag: "Cyber & privacy",
    read: "5 min read",
    updated: "Updated Jun 2026",
  },
  {
    title: "The CAD/CAM blind spot: equipment breakdown sublimits explained",
    tag: "Property & BOP",
    read: "4 min read",
    updated: "Updated Apr 2026",
  },
];

export default function RiskLibraryPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Dental Risk Library
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-faint">
          The knowledge base behind every finding: dental-specific exposures,
          the policy language that addresses them, and the benchmarks we hold
          coverage against. Rules in the analysis engine cite entries here.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.name} className="px-5 py-4 transition-shadow hover:shadow-raised">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[13px] font-semibold text-ink">{c.name}</h3>
              <span className="text-2xs tabular-nums text-ink-faint">
                {c.count} entries
              </span>
            </div>
            <p className="mt-1.5 text-2xs leading-relaxed text-ink-faint">{c.desc}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="border-b border-line px-5 py-3.5">
            <h3 className="text-[13px] font-semibold text-ink">
              Frequently cited exposures
            </h3>
            <p className="mt-0.5 text-2xs text-ink-faint">
              Ranked by citation count across delivered reports, last 90 days
            </p>
          </div>
          <ul className="divide-y divide-line">
            {riskRules.map((r, i) => (
              <li key={r.id} className="flex items-start gap-4 px-5 py-3.5">
                <span className="mt-0.5 w-5 text-right font-serif text-sm font-semibold tabular-nums text-ink-faint">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-ink">{r.title}</p>
                    <SeverityBadge severity={r.severity} />
                  </div>
                  <p className="mt-1 text-2xs leading-relaxed text-ink-faint">
                    {r.description}
                  </p>
                </div>
                <span className="shrink-0 text-2xs font-medium tabular-nums text-brand-700">
                  {r.code}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-line px-5 py-3.5">
            <h3 className="text-[13px] font-semibold text-ink">
              Educational briefs
            </h3>
            <p className="mt-0.5 text-2xs text-ink-faint">
              Client-shareable explainers, written by licensed agents
            </p>
          </div>
          <ul className="divide-y divide-line">
            {articles.map((a) => (
              <li key={a.title} className="px-5 py-3.5 hover:bg-paper/70">
                <p className="text-[13px] font-medium leading-snug text-ink">
                  {a.title}
                </p>
                <p className="mt-1.5 text-2xs text-ink-faint">
                  {a.tag} · {a.read} · {a.updated}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
