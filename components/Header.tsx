"use client";

import { usePathname } from "next/navigation";
import { IconSearch, IconBell } from "./icons";

const titles: [string, string][] = [
  ["/practices", "Practices"],
  ["/review", "Document Review"],
  ["/gap-analyses", "Gap Analyses"],
  ["/reports", "Reports"],
  ["/risk-library", "Dental Risk Library"],
  ["/rules", "Rules"],
  ["/settings", "Settings"],
];

export function Header() {
  const pathname = usePathname();
  const title =
    titles.find(([p]) => pathname.startsWith(p))?.[1] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-line bg-white/95 px-6 backdrop-blur print:hidden">
      <h1 className="text-[15px] font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <div className="ml-auto flex items-center gap-3">
        <label className="relative hidden md:block">
          <span className="sr-only">Search practices, policies, findings</span>
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            placeholder="Search practices, policies, findings…"
            className="h-8 w-72 rounded-md border border-line bg-paper pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-faint focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </label>
        <button
          type="button"
          aria-label="Notifications (2 unread)"
          className="relative rounded-md p-1.5 text-ink-soft hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <IconBell className="h-[18px] w-[18px]" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <span className="h-6 w-px bg-line" aria-hidden="true" />
        <button
          type="button"
          className="flex items-center gap-2 rounded-md p-1 pr-2 hover:bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-700 text-2xs font-semibold text-white"
          >
            MO
          </span>
          <span className="hidden text-left leading-tight lg:block">
            <span className="block text-xs font-medium text-ink">Maya Okafor</span>
            <span className="block text-2xs text-ink-faint">Senior Analyst</span>
          </span>
        </button>
      </div>
    </header>
  );
}
