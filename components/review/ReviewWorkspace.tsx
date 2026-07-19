"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ConfidenceMeter, StatusBadge, SeverityBadge } from "@/components/ui";
import { decideField, setFindingState } from "@/app/actions";
import {
  IconCheck,
  IconEdit,
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconUpload,
} from "@/components/icons";
import type { Confidence, Status } from "@/lib/data";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

export interface FieldData {
  id: string;
  label: string;
  value: string;
  confidence: Confidence;
  status: Status;
  page: number;
  decision: "approved" | "edited" | "rejected" | null;
  bbox: { x: number; y: number; w: number; h: number } | null;
  sourceText: string | null;
}

export interface DocumentData {
  id: string;
  name: string;
  type: string;
  carrier: string;
  pages: number;
  completeness: string;
  status: string;
  hasFile: boolean;
  fields: FieldData[];
}

export interface RuleData {
  code: string;
  title: string;
  severity: "Critical" | "Important" | "Advisory";
  description: string;
}

export interface ProposedFindingData {
  id: string;
  title: string;
  detail: string;
  severity: string;
  status: Status;
  source: string;
  ruleCode: string | null;
}

const completenessCls: Record<string, string> = {
  Complete: "text-emerald-700",
  Partial: "text-amber-700",
  "Missing pages": "text-violet-700",
  "Not received": "text-red-700",
};

const RULE_KEYWORDS: [RegExp, string[]][] = [
  [/sedation|anesthesia/i, ["PL-014"]],
  [/coverage form|tail|erp|retroactive/i, ["PL-006"]],
  [/named insured|associate/i, ["PL-021"]],
  [/equipment/i, ["BOP-load"]],
  [/cyber|aggregate|ransomware|social engineering/i, ["CY-002"]],
  [/class|payroll|employers liability/i, ["WC-003"]],
];

export function ReviewWorkspace({
  practice,
  documents,
  rules,
  proposedFindings,
}: {
  practice: { id: string; name: string };
  documents: DocumentData[];
  rules: RuleData[];
  proposedFindings: ProposedFindingData[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const firstWithFields =
    documents.find((d) => d.fields.length > 0) ?? documents[0];
  const [selectedDocId, setSelectedDocId] = useState(firstWithFields?.id);
  const doc = documents.find((d) => d.id === selectedDocId) ?? firstWithFields;
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    doc?.fields[0]?.id ?? null
  );
  const field =
    doc?.fields.find((f) => f.id === selectedFieldId) ?? doc?.fields[0] ?? null;
  const [page, setPage] = useState(field?.page ?? 1);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const relatedRules = useMemo(() => {
    if (!field) return [];
    const codes = RULE_KEYWORDS.filter(([re]) => re.test(field.label)).flatMap(
      ([, c]) => c
    );
    return rules.filter((r) => codes.includes(r.code));
  }, [field, rules]);

  const proposed = proposedFindings[0] ?? null;
  const reviewed = doc?.fields.filter((f) => f.decision).length ?? 0;
  const fieldPages = Array.from(
    new Set((doc?.fields ?? []).map((f) => f.page))
  ).sort((a, b) => a - b);

  function selectDoc(d: DocumentData) {
    setSelectedDocId(d.id);
    const first = d.fields[0] ?? null;
    setSelectedFieldId(first?.id ?? null);
    setPage(first?.page ?? 1);
  }

  function selectField(f: FieldData) {
    setSelectedFieldId(f.id);
    setPage(f.page);
  }

  function decide(f: FieldData, decision: "approved" | "edited" | "rejected") {
    const next = f.decision === decision ? null : decision;
    if (next === "edited") {
      const edited = window.prompt(`Edit value for “${f.label}”`, f.value);
      if (edited == null) return;
      startTransition(() => decideField(f.id, "edited", edited));
      return;
    }
    startTransition(() => decideField(f.id, next));
  }

  async function onUpload(file: File) {
    setUploading(`Uploading ${file.name}…`);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("practiceId", practice.id);
      setUploading(`Extracting fields from ${file.name}… this can take a minute.`);
      const res = await fetch("/api/documents", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        setUploading(json.error ?? "Upload failed.");
        setTimeout(() => setUploading(null), 6000);
      } else {
        setUploading(null);
        router.refresh();
      }
    } catch {
      setUploading("Upload failed — check your connection and try again.");
      setTimeout(() => setUploading(null), 6000);
    }
  }

  if (!doc) return null;
  const highlight =
    field && field.bbox && field.page === page
      ? { ...field.bbox, label: field.label }
      : null;

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-[272px_minmax(0,1fr)_360px]">
      {/* ── Left: documents & pages ─────────────────────────────── */}
      <section
        aria-label="Uploaded documents"
        className="flex flex-col overflow-hidden border-r border-line bg-white"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <h2 className="text-[13px] font-semibold text-ink">{practice.name}</h2>
            <p className="text-2xs text-ink-faint">
              {documents.length} documents ·{" "}
              {documents.filter((d) => d.hasFile).length} with files
            </p>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            aria-label="Upload policy PDF"
            onClick={() => fileInput.current?.click()}
            disabled={!!uploading}
            className="rounded-md border border-line p-1.5 text-ink-soft hover:bg-paper disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <IconUpload className="h-4 w-4" />
          </button>
        </div>

        {uploading && (
          <p className="border-b border-line bg-brand-50 px-4 py-2 text-2xs text-brand-800">
            {uploading}
          </p>
        )}

        <ul className="flex-1 overflow-y-auto p-2">
          {documents.map((d) => {
            const active = d.id === doc.id;
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => selectDoc(d)}
                  aria-current={active ? "true" : undefined}
                  className={`mb-1 w-full rounded-md border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                    active
                      ? "border-brand-600/40 bg-brand-50"
                      : "border-transparent hover:bg-paper"
                  }`}
                >
                  <p className="text-[13px] font-medium leading-snug text-ink">
                    {d.name}
                  </p>
                  <p className="mt-0.5 text-2xs text-ink-faint">
                    {d.type} · {d.carrier}
                  </p>
                  <p className="mt-1 flex items-center justify-between text-2xs">
                    <span
                      className={`font-medium ${completenessCls[d.completeness] ?? "text-ink-faint"}`}
                    >
                      {d.status === "extracting" ? "Extracting…" : d.completeness}
                    </span>
                    <span className="tabular-nums text-ink-faint">
                      {d.fields.length} fields
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
            {fieldPages.map((p) => (
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
          <p className="mt-1.5 text-2xs text-ink-faint">Pages with extracted fields</p>
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
            <span className="text-ink-faint"> · {doc.carrier}</span>
          </p>
          <div className="flex items-center gap-2 text-2xs text-ink-faint">
            {highlight && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-800 ring-1 ring-inset ring-brand-600/20">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Source language highlighted
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {doc.hasFile ? (
            <>
              <PdfViewer
                url={`/api/documents/${doc.id}/file`}
                page={page}
                highlight={highlight}
              />
              {field && (
                <div className="mx-auto mt-4 max-w-[680px] rounded-md border border-line bg-white px-4 py-3 shadow-card">
                  <p className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
                    Citation for selected field
                  </p>
                  <p className="mt-1.5 text-xs text-ink-soft">
                    <span className="font-medium text-ink">{field.label}</span> — p.{" "}
                    {field.page}
                    {field.sourceText && (
                      <span className="mt-1 block font-serif italic text-ink-faint">
                        “{field.sourceText}”
                      </span>
                    )}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="mx-auto flex h-full max-w-[680px] items-center justify-center">
              <div className="rounded-md border border-dashed border-line bg-white px-10 py-14 text-center">
                <p className="text-[13px] font-medium text-ink">
                  No file received for this document
                </p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-ink-faint">
                  {doc.completeness === "Not received"
                    ? "This policy has been requested from the client but not yet uploaded. Upload it here when it arrives."
                    : "Upload the policy PDF to view and extract it."}
                </p>
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand-700 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-brand-800"
                >
                  <IconUpload className="h-4 w-4" /> Upload PDF
                </button>
              </div>
            </div>
          )}
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
            {reviewed} of {doc.fields.length} reviewed · click a field to view its
            source
          </p>
        </div>

        {doc.fields.length === 0 && (
          <p className="px-4 py-6 text-center text-xs text-ink-faint">
            No fields extracted yet
            {doc.status === "extracting" ? " — extraction in progress." : "."}
          </p>
        )}

        <ul className="divide-y divide-line">
          {doc.fields.map((f) => {
            const active = f.id === field?.id;
            return (
              <li key={f.id}>
                <div
                  className={`px-4 py-3 ${active ? "bg-brand-50/70" : "hover:bg-paper/70"}`}
                >
                  <button
                    type="button"
                    onClick={() => selectField(f)}
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
                    <p className="mt-0.5 text-[13px] font-medium text-ink">{f.value}</p>
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
                      onClick={() => decide(f, "approved")}
                      disabled={isPending}
                      aria-pressed={f.decision === "approved"}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-2xs font-medium ring-1 ring-inset transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                        f.decision === "approved"
                          ? "bg-emerald-600 text-white ring-emerald-600"
                          : "bg-white text-ink-soft ring-line hover:bg-emerald-50 hover:text-emerald-800"
                      }`}
                    >
                      <IconCheck className="h-3 w-3" /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(f, "edited")}
                      disabled={isPending}
                      aria-pressed={f.decision === "edited"}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-2xs font-medium ring-1 ring-inset transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                        f.decision === "edited"
                          ? "bg-blue-600 text-white ring-blue-600"
                          : "bg-white text-ink-soft ring-line hover:bg-blue-50 hover:text-blue-800"
                      }`}
                    >
                      <IconEdit className="h-3 w-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => decide(f, "rejected")}
                      disabled={isPending}
                      aria-pressed={f.decision === "rejected"}
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-2xs font-medium ring-1 ring-inset transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                        f.decision === "rejected"
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

        {relatedRules.length > 0 && (
          <div className="border-t-4 border-paper">
            <div className="border-b border-line px-4 py-3">
              <h3 className="text-[13px] font-semibold text-ink">
                Related dental-risk rules
              </h3>
              <p className="mt-0.5 text-2xs text-ink-faint">
                Triggered by “{field?.label}”
              </p>
            </div>
            <ul className="divide-y divide-line">
              {relatedRules.map((r) => (
                <li key={r.code} className="px-4 py-3">
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
        )}

        {proposed && (
          <div className="mt-auto border-t border-line bg-paper/60 px-4 py-4">
            <h3 className="text-[13px] font-semibold text-ink">
              Proposed finding{" "}
              {proposedFindings.length > 1 && (
                <span className="font-normal text-ink-faint">
                  (1 of {proposedFindings.length})
                </span>
              )}
            </h3>
            <div className="mt-2 rounded-md border border-red-200 bg-red-50/60 p-3">
              <div className="flex items-center gap-2">
                <SeverityBadge
                  severity={proposed.severity as "Critical" | "Important" | "Clarification" | "Strength"}
                />
                <StatusBadge status={proposed.status} />
              </div>
              <p className="mt-2 text-xs font-medium leading-snug text-ink">
                {proposed.title}
              </p>
              <p className="mt-1 text-2xs leading-relaxed text-ink-soft">
                {proposed.detail}
              </p>
              <p className="mt-2 text-2xs text-ink-faint">
                Source: {proposed.source}
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => setFindingState(proposed.id, "APPROVED"))
                }
                className="flex-1 rounded-md bg-brand-700 px-3 py-2 text-[13px] font-medium text-white hover:bg-brand-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                Add to gap analysis
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => setFindingState(proposed.id, "DISMISSED"))
                }
                className="rounded-md border border-line bg-white px-3 py-2 text-[13px] font-medium text-ink-soft hover:bg-paper disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
