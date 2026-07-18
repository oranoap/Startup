import { Card, CardHeader } from "@/components/ui";

const team = [
  { name: "Maya Okafor", role: "Senior Analyst", initials: "MO", access: "Analyst" },
  { name: "Jordan Whitfield", role: "Analyst", initials: "JW", access: "Analyst" },
  { name: "Rafael Castellanos", role: "Analyst", initials: "RC", access: "Analyst" },
  { name: "Dana Reyes, CIC", role: "Licensed Agent", initials: "DR", access: "Sign-off" },
  { name: "Priya Shah", role: "Operations", initials: "PS", access: "Admin" },
];

function Toggle({ label, desc, on }: { label: string; desc: string; on: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-3.5">
      <div>
        <p className="text-[13px] font-medium text-ink">{label}</p>
        <p className="mt-0.5 text-2xs leading-relaxed text-ink-faint">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
          on ? "bg-brand-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
            on ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Analysis workflow"
            subtitle="Controls that govern how findings reach clients"
          />
          <div className="divide-y divide-line">
            <Toggle
              on
              label="Require licensed-agent sign-off before report release"
              desc="Reports cannot be exported or delivered until a licensed agent approves every critical and important finding."
            />
            <Toggle
              on
              label="Block reports with unresolved missing documents"
              desc="If any requested policy is marked Not received, the report stays in draft with a documented exception."
            />
            <Toggle
              on
              label="Show extraction confidence to analysts"
              desc="Display high / medium / low confidence on every extracted field during review."
            />
            <Toggle
              on={false}
              label="Auto-approve high-confidence fields"
              desc="Fields extracted at high confidence skip manual approval. Off by default — recommended for mature carriers only."
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Report branding"
            subtitle="Applied to every executive report and client brief"
          />
          <dl className="divide-y divide-line text-[13px]">
            <div className="flex justify-between px-5 py-3">
              <dt className="text-ink-soft">Firm name</dt>
              <dd className="font-medium text-ink">Insurance by Dentists</dd>
            </div>
            <div className="flex justify-between px-5 py-3">
              <dt className="text-ink-soft">Producer license</dt>
              <dd className="font-medium tabular-nums text-ink">IL #100-482-771</dd>
            </div>
            <div className="flex justify-between px-5 py-3">
              <dt className="text-ink-soft">Report footer disclaimer</dt>
              <dd className="font-medium text-ink">Standard v3 (Apr 2026)</dd>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <dt className="text-ink-soft">Primary color</dt>
              <dd className="flex items-center gap-2 font-medium tabular-nums text-ink">
                <span className="h-4 w-4 rounded-sm bg-brand-700 ring-1 ring-inset ring-black/10" />
                #106F46
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader
            title="Team & access"
            subtitle="Sign-off access is restricted to licensed agents"
            action={
              <button
                type="button"
                className="rounded-md border border-line px-2.5 py-1 text-2xs font-medium text-ink-soft hover:bg-paper"
              >
                Invite
              </button>
            }
          />
          <ul className="divide-y divide-line">
            {team.map((m) => (
              <li key={m.name} className="flex items-center gap-3 px-5 py-3">
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-2xs font-semibold text-brand-800"
                >
                  {m.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink">{m.name}</p>
                  <p className="text-2xs text-ink-faint">{m.role}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-2xs font-medium ring-1 ring-inset ${
                    m.access === "Sign-off"
                      ? "bg-brand-50 text-brand-800 ring-brand-600/20"
                      : m.access === "Admin"
                        ? "bg-violet-50 text-violet-800 ring-violet-600/20"
                        : "bg-slate-100 text-slate-700 ring-slate-500/20"
                  }`}
                >
                  {m.access}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Document intake"
            subtitle="How policies arrive for analysis"
          />
          <div className="divide-y divide-line">
            <Toggle
              on
              label="Client upload portal"
              desc="Practices upload policies through a secure branded portal; files are virus-scanned and encrypted at rest."
            />
            <Toggle
              on
              label="Email-in intake (docs@insurancebydentists.com)"
              desc="Attachments from verified client addresses are filed to the matching practice automatically."
            />
            <Toggle
              on={false}
              label="Carrier API retrieval"
              desc="Pull declarations directly from supported carriers. Currently in pilot with two carriers."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
