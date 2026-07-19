"use client";

import { Suspense, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { LogoMark } from "@/components/Logo";

const demoAccounts = [
  { email: "maya@insurancebydentists.com", label: "Maya Okafor — Analyst" },
  { email: "dana@insurancebydentists.com", label: "Dana Reyes — Licensed Agent (sign-off)" },
  { email: "priya@insurancebydentists.com", label: "Priya Shah — Admin" },
];

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("maya@insurancebydentists.com");
  const [password, setPassword] = useState("demo1234");
  const [busy, setBusy] = useState(false);
  const failed = params.get("error");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    await signIn("credentials", { email, password, callbackUrl: "/" });
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <div>
            <p className="text-[15px] font-semibold tracking-tight text-white">
              Insurance by Dentists
            </p>
            <p className="text-2xs font-medium uppercase tracking-[0.12em] text-brand-300">
              Risk Analysis Platform
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-lg border border-white/10 bg-white p-6 shadow-raised"
        >
          <h1 className="text-[15px] font-semibold text-ink">Sign in</h1>
          {failed && (
            <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-800 ring-1 ring-inset ring-red-600/20">
              That email and password combination didn&rsquo;t work. Try again.
            </p>
          )}
          <label className="mt-4 block">
            <span className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
              className="mt-1 h-9 w-full rounded-md border border-line bg-white px-3 text-[13px] text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-2xs font-medium uppercase tracking-[0.08em] text-ink-faint">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-1 h-9 w-full rounded-md border border-line bg-white px-3 text-[13px] text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="mt-5 h-9 w-full rounded-md bg-brand-700 text-[13px] font-medium text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-2xs font-medium uppercase tracking-[0.1em] text-brand-300">
            Demo accounts · password: demo1234
          </p>
          <ul className="mt-2 space-y-1">
            {demoAccounts.map((a) => (
              <li key={a.email}>
                <button
                  type="button"
                  onClick={() => setEmail(a.email)}
                  className="text-left text-xs text-brand-100/80 underline-offset-2 hover:text-white hover:underline"
                >
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
