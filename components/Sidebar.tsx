"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoLockup } from "./Logo";
import {
  IconDashboard,
  IconPractices,
  IconDocReview,
  IconGap,
  IconReports,
  IconLibrary,
  IconRules,
  IconSettings,
} from "./icons";

const nav = [
  { href: "/", label: "Dashboard", icon: IconDashboard },
  { href: "/practices", label: "Practices", icon: IconPractices },
  { href: "/review", label: "Document Review", icon: IconDocReview },
  { href: "/gap-analyses", label: "Gap Analyses", icon: IconGap },
  { href: "/reports", label: "Reports", icon: IconReports },
  { href: "/risk-library", label: "Dental Risk Library", icon: IconLibrary },
  { href: "/rules", label: "Rules", icon: IconRules },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-brand-950 print:hidden">
      <div className="flex h-14 items-center border-b border-white/10 px-4">
        <Link href="/" className="rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400">
          <LogoLockup />
        </Link>
      </div>
      <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-400 ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-brand-100/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`h-[18px] w-[18px] shrink-0 ${
                      active ? "text-brand-400" : "text-brand-100/50 group-hover:text-brand-300"
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="text-2xs leading-relaxed text-brand-100/50">
          Internal analysis tool. Findings require licensed-agent review before
          client delivery.
        </p>
      </div>
    </aside>
  );
}
