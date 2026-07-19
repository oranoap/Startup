"use client";

import { useState, useTransition } from "react";
import { setFindingState, signOffAnalysis, revokeSignOff } from "@/app/actions";
import { IconCheck, IconX, IconDownload } from "@/components/icons";

export function FindingStateButtons({ findingId }: { findingId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <span className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => setFindingState(findingId, "APPROVED"))}
        className="inline-flex items-center gap-1 rounded-md bg-brand-700 px-2.5 py-1 text-2xs font-medium text-white hover:bg-brand-800 disabled:opacity-60"
      >
        <IconCheck className="h-3 w-3" /> Approve for report
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => setFindingState(findingId, "DISMISSED"))}
        className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1 text-2xs font-medium text-ink-soft hover:bg-paper disabled:opacity-60"
      >
        <IconX className="h-3 w-3" /> Dismiss
      </button>
    </span>
  );
}

export function SignOffButton({
  analysisId,
  signedOff,
  canSignOff,
}: {
  analysisId: string;
  signedOff: boolean;
  canSignOff: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  if (!canSignOff) {
    return (
      <p className="text-2xs text-ink-faint">
        Sign-off is restricted to licensed agents.
      </p>
    );
  }
  return signedOff ? (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => revokeSignOff(analysisId))}
      className="rounded-md border border-line bg-white px-3 py-1.5 text-2xs font-medium text-ink-soft hover:bg-paper disabled:opacity-60"
    >
      Revoke sign-off
    </button>
  ) : (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => signOffAnalysis(analysisId))}
      className="rounded-md bg-brand-700 px-3 py-1.5 text-2xs font-medium text-white hover:bg-brand-800 disabled:opacity-60"
    >
      Sign off findings
    </button>
  );
}

export function ExportPdfButton({
  analysisId,
  enabled,
}: {
  analysisId: string;
  enabled: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportPdf() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${analysisId}/pdf`);
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error ?? "Export failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers.get("Content-Disposition")?.match(/filename="(.+)"/)?.[1] ??
        "gap-analysis.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={exportPdf}
        disabled={!enabled || busy}
        title={
          enabled
            ? "Export the signed-off report as PDF"
            : "Requires licensed-agent sign-off before export"
        }
        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand-700 px-3.5 text-[13px] font-medium text-white hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <IconDownload className="h-4 w-4" />
        {busy ? "Rendering PDF…" : "Export PDF"}
      </button>
      {error && <span className="text-2xs text-red-700">{error}</span>}
      {!enabled && (
        <span className="text-2xs text-ink-faint">Requires agent sign-off</span>
      )}
    </span>
  );
}
