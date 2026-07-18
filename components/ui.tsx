import type { ReactNode } from "react";
import { STATUS_META, type Confidence, type Status } from "@/lib/data";

export function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-medium ring-1 ring-inset ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

const CONF_META: Record<Confidence, { label: string; bars: number; cls: string }> = {
  high: { label: "High confidence", bars: 3, cls: "bg-emerald-600" },
  medium: { label: "Medium confidence", bars: 2, cls: "bg-amber-500" },
  low: { label: "Low confidence", bars: 1, cls: "bg-red-500" },
};

export function ConfidenceMeter({ level }: { level: Confidence }) {
  const meta = CONF_META[level];
  return (
    <span className="inline-flex items-center gap-1.5" title={meta.label}>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-1 rounded-sm ${i === 1 ? "h-1.5" : i === 2 ? "h-2.5" : "h-3.5"} ${
              i <= meta.bars ? meta.cls : "bg-slate-200"
            }`}
          />
        ))}
      </span>
      <span className="text-2xs text-ink-faint">{meta.label}</span>
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-line bg-white shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5">
      <div>
        <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-2xs text-ink-faint">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function ProgressBar({
  value,
  label,
  className = "",
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}
    >
      <div
        className="h-full rounded-full bg-brand-600 transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export function SeverityBadge({
  severity,
}: {
  severity: "Critical" | "Important" | "Advisory" | "Clarification" | "Strength";
}) {
  const cls =
    severity === "Critical"
      ? "bg-red-50 text-red-800 ring-red-600/20"
      : severity === "Important"
        ? "bg-amber-50 text-amber-900 ring-amber-600/25"
        : severity === "Strength"
          ? "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
          : "bg-slate-100 text-slate-700 ring-slate-500/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-semibold ring-1 ring-inset ${cls}`}
    >
      {severity}
    </span>
  );
}
