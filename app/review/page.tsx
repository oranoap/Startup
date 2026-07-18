"use client";

import { useState } from "react";
import { ConfidenceMeter, StatusBadge, SeverityBadge } from "@/components/ui";
import {
  documents,
  extractedFields,
  riskRules,
  type ExtractedField,
} from "@/lib/data";
import {
  IconCheck,
  IconEdit,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconUpload,
} from "@/components/icons";

const completenessCls: Record<string, string> = {
  Complete: "text-emerald-700",
  Partial: "text-amber-700",
  "Missing pages": "text-violet-700",
  "Not received": "text-red-700",
};

// Mock policy page copy — the highlighted sentence is the source language for
// the currently selected field.
const policyPage = {
  header: "MERIDIAN ASSURANCE COMPANY — PROFESSIONAL LIABILITY POLICY",
  section: "SECTION IV — EXCLUSIONS (continued)",
  paras: [
    "j. arising out of the performance of any procedure for which the insured has not been credentialed by the applicable state dental board, or which falls outside the lawful scope of the insured's license;",
    "k. arising out of the administration of general anesthesia, deep sedation, or intravenous moderate sedation, whether administered by the insured or by any person for whose acts the insured is legally responsible, unless coverage is specifically added by endorsement to this policy;",
    "l. arising out of the prescribing or dispensing of controlled substances other than in the ordinary course of dental treatment and in accordance with applicable federal and state law;",
    "m. arising out of any express warranty or guarantee of the result of any treatment or procedure, provided that this exclusion shall not apply to the insured's liability that would exist in the absence of such warranty or guarantee;",
  ],
  highlightIndex: 1,
};

export default function ReviewPage() {
  const [selectedDoc, setSelectedDoc] = useState("d1");
  const [selectedField, setSelectedField] = useState("f7");
  const [page, setPage] = useState(23);
  const [decisions, setDecisions] = useState<
    Record<string, ExtractedField["decision"]>
  >({ f1: "approved", f2: "approved" });

  const doc = documents.find((d) => d.id === selectedDoc)!;
  const field = extractedFields.find((f) => f.id === selectedField)!;
  const relatedRules = riskRules.filter((r) =>
    ["PL-014", "PL-006"].includes(r.code)
  );

  const decide = (id: string, d: ExtractedField["decision"]) =>
    setDecisions((prev) => ({ ...prev, [id]: prev[id] === d ? undefined : d }));

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-[272px_minmax(0,1fr)_360px]">
      {/* ── Left: documents & pages ─────────────────────────────── */}
      <section
        aria-label="Uploaded documents"
        className="flex flex-col overflow-hidden border-r border-line bg-white"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <h2 className="text-[13px] font-semibold text-ink">
              Lakeview Family Dental
            </h2>
            <p className="text-2xs text-ink-faint">5 policies · 4 uploaded</p>
          </div>
          <button
            type="button"
            aria-label="Upload document"
            className="rounded-md border border-line p-1.5 text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <IconUpload className="h-4 w-4" />
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto p-2">
          {documents.map((d) => {
            const active = d.id === selectedDoc;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(d.id)}
                  aria-current={active ? "true" : undefined}
                  className={`w-full rounded-md border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                    active
                      ? "border-brand-600/40 bg-brand-50"
                      : "border-transparent hover:bg-paper"
                  } mb-1`}
                >
                  <p className="text-[13px] font-medium leading-snug text-ink">
                    {d.name}
                  </p>
                  <p className="mt-0.5 text-2xs text-ink-faint">
                    {d.type} · {d.carrier}
                  </p>
                  <p className="mt-1 flex items-center justify-between text-2xs">
                    <span className={`font-medium ${completenessCls[d.completeness]}`}>
                      {d.completeness}
                    </span>
                    <span className="tabular-nums text-ink-faint">
                      {d.fieldsExtracted}/{d.fieldsTotal} fields
                    </span>
                  </p>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-line px-4 py-3">
          <p className="mb-2 text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
            Page navigation
          </p>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
              className="rounded-md border border-line p-1.5 text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-xs tabular-nums text-ink-soft">
              Page <span className="font-semibold text-ink">{page}</span> of{" "}
              {doc.pages || "—"}
            </p>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(doc.pages || p, p + 1))}
              aria-label="Next page"
              className="rounded-md border border-line p-1.5 text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {[2, 3, 4, 12, 17, 23, 26].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`rounded px-1.5 py-0.5 text-2xs tabular-nums ring-1 ring-inset ${
                  p === page
                    ? "bg-brand-700 text-white ring-brand-700"
                    : "bg-paper text-ink-soft ring-line hover:bg-slate-100"
                }`}
                aria-label={`Go to page ${p} (contains extracted field)`}
              >
                {p}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-2xs text-ink-faint">
            Pages with extracted fields
          </p>
        </div>
      </section>

      {/* ── Center: policy viewer ───────────────────────────────── */}
      <section
        aria-label="Policy viewer"
        className="flex flex-col overflow-hidden bg-slate-100"
      >
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-2.5">
          <p className="truncate text-xs font-medium text-ink-soft">
            {doc.name}
            <span className="text-ink-faint"> · {doc.carrier} · Policy DP-4471-882</span>
          </p>
          <div className="flex items-center gap-2 text-2xs text-ink-faint">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-800 ring-1 ring-inset ring-brand-600/20">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Source language highlighted
            </span>
            <span>100%</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {/* Simulated PDF page */}
          <div className="mx-auto max-w-[680px] rounded-sm border border-slate-300 bg-white px-14 py-12 shadow-raised">
            <p className="text-center text-2xs font-semibold tracking-[0.12em] text-slate-500">
              {policyPage.header}
            </p>
            <p className="mt-8 font-serif text-[13px] font-semibold text-slate-800">
              {policyPage.section}
            </p>
            <p className="mt-4 font-serif text-[13px] leading-relaxed text-slate-700">
              This insurance does not apply to any claim or claim expenses:
            </p>
            <div className="mt-3 space-y-3">
              {policyPage.paras.map((text, i) =>
                i === policyPage.highlightIndex ? (
                  <p
                    key={i}
                    className="relative rounded-sm bg-amber-100/80 py-1 pl-3 pr-2 font-serif text-[13px] leading-relaxed text-slate-800 ring-1 ring-inset ring-amber-400/60"
                  >
                    <span
                      className="absolute -left-px top-0 h-full w-1 rounded-l-sm bg-amber-500"
                      aria-hidden="true"
                    />
                    {text}
                    <span className="mt-1.5 block text-2xs font-sans font-medium text-amber-900">
                      Cited for “Sedation / anesthesia coverage” — p. {page}, Section IV(k)
                    </span>
                  </p>
                ) : (
                  <p
                    key={i}
                    className="font-serif text-[13px] leading-relaxed text-slate-700"
                  >
                    {text}
                  </p>
                )
              )}
            </div>
            <p className="mt-10 text-center text-2xs text-slate-400">
              DP-4471-882 · Page {page} of {doc.pages} · Ed. 04/2024
            </p>
          </div>

          {/* Citation strip */}
          <div className="mx-auto mt-4 max-w-[680px] rounded-md border border-line bg-white px-4 py-3 shadow-card">
            <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              Page-level citations on this page
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-ink-soft">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-amber-400" aria-hidden="true" />
                Section IV(k) — IV sedation exclusion → field
                <button
                  type="button"
                  onClick={() => setSelectedField("f7")}
                  className="font-medium text-brand-700 underline-offset-2 hover:underline"
                >
                  Sedation / anesthesia coverage
                </button>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-slate-300" aria-hidden="true" />
                Section IV(j) — scope-of-license exclusion · no field mapped
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Right: extraction & findings ────────────────────────── */}
      <section
        aria-label="Extracted fields and findings"
        className="flex flex-col overflow-y-auto border-l border-line bg-white"
      >
        <div className="border-b border-line px-4 py-3">
          <h2 className="text-[13px] font-semibold text-ink">Extracted fields</h2>
          <p className="mt-0.5 text-2xs text-ink-faint">
            {Object.values(decisions).filter(Boolean).length} of{" "}
            {extractedFields.length} reviewed · click a field to view its source
          </p>
        </div>

        <ul className="divide-y divide-line">
          {extractedFields.map((f) => {
            const active = f.id === selectedField;
            const decision = decisions[f.id];
            return (
              <li key={f.id}>
                <div
                  className={`px-4 py-3 ${active ? "bg-brand-50/70" : "hover:bg-paper/70"}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedField(f.id);
                      setPage(f.page);
                    }}
                    className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-2xs font-medium uppercase tracking-[0.06em] text-ink-faint">
                        {f.label}
                      </p>
                      <span className="shrink-0 text-2xs tabular-nums text-ink-faint">
                        p. {f.page}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] font-medium text-ink">
                      {f.value}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <ConfidenceMeter level={f.confidence} />
                      <StatusBadge status={f.status} />
                    </div>
                  </button>
                  <div
                    className="mt-2 flex items-center gap-1.5"
                    role="group"
                    aria-label={`Review decision for ${f.label}`}
                  >
                    <button
                      type="button"
                      onClick={() => decide(f.id, "approved")}
                      aria-pressed={decision === "approved"}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-2xs font-medium ring-1 ring-inset transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                        decision === "approved"
                          ? "bg-emerald-600 text-white ring-emerald-600"
                          : "bg-white text-ink-soft ring-line hover:bg-emerald-50 hover:text-emerald-800"
                      }`}
                    >
                      <IconCheck className="h-3 w-3" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(f.id, "edited")}
                      aria-pressed={decision === "edited"}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-2xs font-medium ring-1 ring-inset transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                        decision === "edited"
                          ? "bg-blue-600 text-white ring-blue-600"
                          : "bg-white text-ink-soft ring-line hover:bg-blue-50 hover:text-blue-800"
                      }`}
                    >
                      <IconEdit className="h-3 w-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(f.id, "rejected")}
                      aria-pressed={decision === "rejected"}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-2xs font-medium ring-1 ring-inset transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                        decision === "rejected"
                          ? "bg-red-600 text-white ring-red-600"
                          : "bg-white text-ink-soft ring-line hover:bg-red-50 hover:text-red-800"
                      }`}
                    >
                      <IconX className="h-3 w-3" /> Reject
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t-4 border-paper">
          <div className="border-b border-line px-4 py-3">
            <h3 className="text-[13px] font-semibold text-ink">
              Related dental-risk rules
            </h3>
            <p className="mt-0.5 text-2xs text-ink-faint">
              Triggered by “{field.label}”
            </p>
          </div>
          <ul className="divide-y divide-line">
            {relatedRules.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-2xs font-semibold tabular-nums text-brand-700">
                    {r.code}
                  </p>
                  <SeverityBadge severity={r.severity} />
                </div>
                <p className="mt-1 text-xs font-medium text-ink">{r.title}</p>
                <p className="mt-1 text-2xs leading-relaxed text-ink-faint">
                  {r.description}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto border-t border-line bg-paper/60 px-4 py-4">
          <h3 className="text-[13px] font-semibold text-ink">Proposed finding</h3>
          <div className="mt-2 rounded-md border border-red-200 bg-red-50/60 p-3">
            <div className="flex items-center gap-2">
              <SeverityBadge severity="Critical" />
              <StatusBadge status="potential-gap" />
            </div>
            <p className="mt-2 text-xs font-medium leading-snug text-ink">
              IV sedation excluded while practice performs sedation dentistry
            </p>
            <p className="mt-1 text-2xs leading-relaxed text-ink-soft">
              Endorsement E-114 excludes IV moderate sedation; the practice
              profile lists sedation dentistry at both locations. Recommend
              anesthesia endorsement or standalone coverage.
            </p>
            <p className="mt-2 text-2xs text-ink-faint">
              Source: p. 23, Section IV(k) · Rule PL-014
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-md bg-brand-700 px-3 py-2 text-[13px] font-medium text-white hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Add to gap analysis
            </button>
            <button
              type="button"
              className="rounded-md border border-line bg-white px-3 py-2 text-[13px] font-medium text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            >
              Dismiss
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
