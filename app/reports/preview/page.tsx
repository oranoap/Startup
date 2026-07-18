import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { findings } from "@/lib/data";
import { IconChevronLeft, IconDownload } from "@/components/icons";

const sevOrder = ["Critical", "Important", "Clarification"] as const;

const sevIntro: Record<(typeof sevOrder)[number], string> = {
  Critical:
    "These items represent scenarios where a claim could be uninsured or materially under-insured today. We recommend addressing them before anything else.",
  Important:
    "These items should be resolved at or before your next renewal. They are unlikely to leave you fully uninsured, but they narrow your protection in ways that matter for a dental practice.",
  Clarification:
    "These are open questions we could not resolve from the documents provided. Answering them may close an item entirely — or surface additional work.",
};

export default function ReportPreviewPage() {
  const strengths = findings.filter((f) => f.severity === "Strength");

  return (
    <div className="p-6">
      {/* Toolbar (hidden in print) */}
      <div className="mx-auto mb-4 flex max-w-[840px] items-center justify-between print:hidden">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink"
        >
          <IconChevronLeft className="h-4 w-4" /> Back to report dashboard
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-2xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-600/25">
            Draft — pending agent sign-off
          </span>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-700 px-3.5 text-[13px] font-medium text-white hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <IconDownload className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Report document */}
      <article className="mx-auto max-w-[840px] rounded-sm border border-line bg-white shadow-raised print:border-0 print:shadow-none">
        {/* Masthead */}
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
              <p>Report IBD-2026-0341</p>
              <p>Prepared July 18, 2026</p>
              <p>Reviewed by D. Reyes, CIC</p>
            </div>
          </div>
          <h1 className="mt-10 font-serif text-[28px] font-semibold leading-tight tracking-tight text-ink">
            Insurance Gap Analysis for
            <br />
            Lakeview Family Dental
          </h1>
          <p className="mt-3 text-[13px] text-ink-soft">
            Prepared for Dr. Elena Vasquez, DDS — Practice Owner · Naperville
            &amp; Aurora, Illinois
          </p>
        </header>

        {/* Executive summary */}
        <section className="px-12 py-10">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Executive summary
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
            We reviewed five lines of coverage for Lakeview Family Dental,
            reading each policy in full rather than relying on declarations
            pages alone. Your program has real strengths: malpractice limits
            that meet the benchmark for a four-dentist Illinois practice,
            defense costs outside the limits, and a pure consent-to-settle
            clause that many carriers no longer offer.
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
            We also found <strong className="font-semibold text-ink">two
            critical items</strong> that deserve prompt attention: your
            malpractice policy excludes IV sedation even though your practice
            offers it, and two of your treating associates are not listed on
            the policy. Both are correctable — typically by endorsement — but
            until then they represent your practice&rsquo;s largest uninsured
            exposures. Three further items should be addressed at renewal, and
            two open questions need a short conversation to resolve.
          </p>
          <div className="mt-6 grid grid-cols-4 divide-x divide-line rounded-md border border-line">
            {[
              ["2", "Critical items"],
              ["3", "Renewal items"],
              ["2", "Open questions"],
              ["3", "Confirmed strengths"],
            ].map(([n, l]) => (
              <div key={l} className="px-4 py-3 text-center">
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

        {/* Findings sections */}
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
                      <h3 className="text-[13.5px] font-semibold text-ink">
                        {f.title}
                      </h3>
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

        {/* Strengths */}
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
                    <path
                      d="m2 5.2 2 2 4-4.5"
                      stroke="#047857"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div>
                  <h3 className="text-[13.5px] font-semibold text-ink">{f.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                    {f.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Next steps + footer */}
        <section className="border-t border-line bg-brand-50/50 px-12 py-10">
          <h2 className="font-serif text-lg font-semibold text-ink">
            Recommended next steps
          </h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-ink-soft">
            <li>
              Request an anesthesia/sedation endorsement quote from Meridian
              Assurance, or a standalone quote if the carrier declines.
            </li>
            <li>
              Add Drs. Patel and Nguyen to the professional liability policy by
              endorsement, effective immediately.
            </li>
            <li>
              Obtain written confirmation of tail (ERP) terms and the entity
              status of the 2021 Ogden Ave acquisition.
            </li>
            <li>
              At renewal: raise the equipment-breakdown sublimit to scheduled
              replacement value and increase cyber limits to $1M.
            </li>
          </ol>
          <p className="mt-6 text-[13px] text-ink-soft">
            We&rsquo;re glad to walk through any of this with you —
            most items take a single call with the carrier to set in motion.
          </p>
        </section>

        <footer className="border-t border-line px-12 py-6">
          <p className="text-2xs leading-relaxed text-ink-faint">
            This analysis is based on the policy documents provided as of July
            18, 2026 and the practice profile supplied by Lakeview Family
            Dental. It is a professional review of coverage terms, not a
            guarantee of coverage; final determinations rest with the issuing
            carriers. Insurance by Dentists · Licensed insurance producer, IL
            #100-482-771.
          </p>
        </footer>
      </article>
    </div>
  );
}
