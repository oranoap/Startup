export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {/* Shield */}
      <path
        d="M20 2.5 34.5 8v10.6c0 9.3-6.2 15.9-14.5 18.9C11.7 34.5 5.5 27.9 5.5 18.6V8L20 2.5Z"
        fill="#106f46"
      />
      {/* Tooth silhouette, drawn restrained and geometric */}
      <path
        d="M14.4 12.2c1.8-1.5 4-1 5.6 0 1.6-1 3.8-1.5 5.6 0 2 1.7 2.1 4.6 1 7-1 2.2-1.5 4.6-1.8 7-.1 1-.6 1.7-1.3 1.7-.8 0-1.1-.8-1.3-1.7l-.9-3.8c-.2-.9-.7-1.5-1.3-1.5s-1.1.6-1.3 1.5l-.9 3.8c-.2.9-.5 1.7-1.3 1.7-.7 0-1.2-.7-1.3-1.7-.3-2.4-.8-4.8-1.8-7-1.1-2.4-1-5.3 1-7Z"
        fill="#fff"
      />
      <path
        d="M20 2.5 34.5 8v10.6c0 9.3-6.2 15.9-14.5 18.9"
        fill="none"
        stroke="#4cdd9f"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

export function LogoLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="h-8 w-8 shrink-0" />
      {!compact && (
        <span className="leading-tight">
          <span className="block whitespace-nowrap text-[13px] font-semibold tracking-tight text-white">
            Insurance by Dentists
          </span>
          <span className="block whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-brand-300">
            Risk Analysis Platform
          </span>
        </span>
      )}
    </span>
  );
}
