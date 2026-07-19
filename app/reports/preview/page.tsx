import Link from "next/link";
import { db } from "@/lib/db";
import { LogoMark } from "@/components/Logo";
import { ExportPdfButton } from "@/components/reports/ReportControls";
import { IconChevronLeft } from "@/components/icons";

export const dynamic = "force-dynamic";

const sevOrder = ["Critical", "Important", "Clarification"] as const;

const sevIntro: Record<(typeof sevOrder)[number], string> = {
  Critical:
    "These items represent scenarios where a claim could be uninsured or materially under-insured today. We recommend addressing them before anything else.",
  Important:
    "These items should be resolved at or before your next renewal. They are unlikely to leave you fully uninsured, but they narrow your protection in ways that matter for a dental practice.",
  Clarification:
    "These are open questions we could not resolve from the documents provided. Answering them may close an item entirely — or surface additional work.",
};

export default async function ReportPreviewPage() {
  const practice = await db.practice.findFirst({
    orderBy: { updatedAt: "desc" },
    where: { analyses: { some: {} }, documents: { some: {} } },
    include: {
      analyses: {
        include: {
          findings: { where: { state: "APPROVED" }, orderBy: { order: "asc" } },
        },
      },
    },
  });
  const analysis = practice?.analyses[0];
  if (!practice || !analysis) {
    return <p className="p-10 text-center text-sm text-ink-faint">No analysis found.</p>;
  }

  const findings = analysis.findings;
  const strengths = findings.filter((f) => f.severity === "Strength");
  const counts = {
    critical: findings.filter((f) => f.severity === "Critical").length,
    important: findings.filter((f) => f.severity === "Important").length,
    open: findings.filter((f) => f.severity === "Clarification").length,
    strengths: strengths.length,
  };
  const signedOff = !!analysis.signedOffAt;
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="p-6">
      <div className="mx-auto mb-4 flex max-w-[840px] items-center justify-between print:hidden">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink"
        >
          <IconChevronLeft className="h-4 w-4" /> Back to report dashboard
        </Link>
        <div className="flex items-center gap-2">
          {signedOff ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-2xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/25">
              Signed off by {analysis.signedOffBy}
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-2xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-600/25">
              Draft — pending agent sign-off
            </span>
          )}
          <ExportPdfButton analysisId={analysis.id} enabled={signedOff} />
        </div>
      </div>

      <article className="relative mx-auto max-w-[840px] rounded-sm border border-line bg-white shadow-raised print:border-0 print:shadow-none">
        {!signedOff && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-64 select-none text-center font-serif text-[90px] font-semibold uppercase tracking-[0.2em] text-red-600/10"
          >
            Draft
          </p>
        )}
        <header className="border-b-2 border-brand-700 px-12 pb-8 pt-12">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <LogoMark className="h-11 w-11" />
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-ink">
                  Insurance by Dentists
                </p>
                <p className="text-2xs font-medium uppercase tracking-[0.14em] text-brand-700">
                  Practice Insurance Gap Analysis
                </p>
              </div>
            </div>
            <div className="text-right text-2xs leading-relaxed text-ink-faint">
              <p>Report IBD-{new Date().getFullYear()}-{analysis.id.slice(-4).toUpperCase()}</p>
              <p>Prepared {today}</p>
              <p>
                {signedOff
                  ? `Reviewed by ${analysis.signedOffBy}`
                  : "Pending licensed-agent review"}
              </p>
            </div>
          </div>
          <h1 className="mt-10 font-serif text-[28px] font-semibold leading-tight tracking-tight text-ink">
            Insurance Gap Analysis for
            <br />
            {practice.name}
          </h1>
          <p className="mt-3 text-[13px] text-ink-soft">
            Prepared for the practice owner · {practice.location} ·{" "}
            {practice.specialty}
          </p>
        </header>

        <section className="px-12 py-10">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Executive summary
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
            We reviewed the insurance program for {practice.name}, reading each
            supplied policy in full rather than relying on declarations pages
            alone, and comparing the coverage terms against the exposures of a{" "}
            {practice.dentists}-dentist {practice.specialty.toLowerCase()}{" "}
            practice.
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
            {counts.critical > 0 ? (
              <>
                We found{" "}
                <strong className="font-semibold text-ink">
                  {counts.critical} critical item{counts.critical > 1 ? "s" : ""}
                </strong>{" "}
                that deserve prompt attention, {counts.important} item
                {counts.important === 1 ? "" : "s"} to address at renewal, and{" "}
                {counts.open} open question{counts.open === 1 ? "" : "s"} that
                need a short conversation to resolve.
              </>
            ) : (
              <>
                We found no critical items. {counts.important} item
                {counts.important === 1 ? "" : "s"} should be addressed at
                renewal, and {counts.open} open question
                {counts.open === 1 ? "" : "s"} remain.
              </>
            )}{" "}
            Your program also has {counts.strengths} confirmed strength
            {counts.strengths === 1 ? "" : "s"} worth preserving.
          </p>
          <div className="mt-6 grid grid-cols-4 divide-x divide-line rounded-md border border-line">
            {[
              [counts.critical, "Critical items"],
              [counts.important, "Renewal items"],
              [counts.open, "Open questions"],
              [counts.strengths, "Confirmed strengths"],
            ].map(([n, l]) => (
              <div key={l as string} className="px-4 py-3 text-center">
                <p className="font-serif text-xl font-semibold text-ink">{n}</p>
                <p className="mt-0.5 text-2xs text-ink-faint">{l}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-2xs leading-relaxed text-ink-faint">
            We intentionally do not reduce your insurance program to a single
            score. Each item below stands on the specific policy language it
            cites, so you and your carrier can act on it directly.
          </p>
        </section>

        {sevOrder.map((sev) => {
          const items = findings.filter((f) => f.severity === sev);
          if (items.length === 0) return null;
          return (
            <section key={sev} className="border-t border-line px-12 py-10">
              <h2 className="font-serif text-lg font-semibold text-ink">
                {sev === "Critical"
                  ? "Critical items"
                  : sev === "Important"
                    ? "Items to address at renewal"
                    : "Open questions"}
              </h2>
              <p className="mt-2 max-w-[600px] text-xs leading-relaxed text-ink-faint">
                {sevIntro[sev]}
              </p>
              <ol className="mt-6 space-y-6">
                {items.map((f, i) => (
                  <li key={f.id} className="flex gap-4">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-serif text-[13px] font-semibold ${
                        sev === "Critical"
                          ? "bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/30"
                          : sev === "Important"
                            ? "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-600/30"
                            : "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-600/30"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-ink">{f.title}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                        {f.detail}
                      </p>
                      <p className="mt-1.5 text-2xs text-ink-faint">
                        Policy reference: {f.source}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}

        {strengths.length > 0 && (
          <section className="border-t border-line px-12 py-10">
            <h2 className="font-serif text-lg font-semibold text-ink">
              What your program does well
            </h2>
            <p className="mt-2 max-w-[600px] text-xs leading-relaxed text-ink-faint">
              These provisions are better than what much of the market offers a
              practice of your size. They are worth protecting when you renew or
              remarket.
            </p>
            <ul className="mt-6 space-y-5">
              {strengths.map((f) => (
                <li key={f.id} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-inset ring-emerald-600/30"
                  >
                    <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none">
                      <path d="m2 5.2 2 2 4-4.5" stroke="#047857" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-[13.5px] font-semibold text-ink">{f.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{f.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="border-t border-line bg-brand-50/50 px-12 py-10">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Recommended next steps
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-ink-soft">
            {findings
              .filter((f) => f.severity === "Critical" || f.severity === "Important")
              .slice(0, 5)
              .map((f) => (
                <li key={f.id}>{f.title}: see the item above for the specific action.</li>
              ))}
            <li>
              Schedule a review call with your Insurance by Dentists agent — most
              items take a single call with the carrier to set in motion.
            </li>
          </ol>
        </section>

        <footer className="border-t border-line px-12 py-6">
          <p className="text-2xs leading-relaxed text-ink-faint">
            This analysis is based on the policy documents provided as of {today}{" "}
            and the practice profile supplied by {practice.name}. It is a
            professional review of coverage terms, not a guarantee of coverage;
            final determinations rest with the issuing carriers. Insurance by
            Dentists · Licensed insurance producer, IL #100-482-771.
          </p>
        </footer>
      </article>
    </div>
  );
}
