# Insurance by Dentists — Risk Analysis Platform

Internal application for insurance professionals at Insurance by Dentists:
upload dental-practice insurance policies, verify AI-extracted coverage
information against the policy's own language, and produce a practice-ready
insurance gap-analysis report with licensed-agent sign-off.

## Quick start

```bash
npm install
npm run db:setup   # creates SQLite schema, seeds sample data + sample policy PDFs
npm run dev        # http://localhost:3000
```

Demo accounts (password `demo1234`):

| Email | Role |
|---|---|
| `maya@insurancebydentists.com` | Analyst |
| `dana@insurancebydentists.com` | Licensed Agent (sign-off) |
| `priya@insurancebydentists.com` | Admin |

## What works end-to-end

- **Auth & roles** — NextAuth credentials sign-in; sign-off restricted to
  licensed agents, report export gated behind sign-off.
- **Document Review workspace** — three columns: document list with
  completeness and page navigation; a real PDF.js viewer with cited source
  language highlighted from stored coordinates; extracted fields with
  confidence meters and persisted approve/edit/reject decisions, related
  risk rules and proposed findings.
- **Upload → extraction** — drag a policy PDF in; it is stored, paged, and
  run through the extraction provider. With `ANTHROPIC_API_KEY` set, Claude
  reads the PDF (built-in OCR) under the governing system prompt in
  `lib/extraction/system-prompt.ts` and returns schema-validated fields and
  findings with citations and confidence. Without a key, a deterministic
  mock provider keeps the whole flow demoable.
- **Rules engine** — `lib/rules-engine.ts` compares extracted fields and the
  practice exposure profile against the approved rules (sedation exclusions,
  tail coverage, unlisted dentists, equipment sublimits, cyber benchmarks)
  and proposes findings. Proposals never publish directly: analyst approval
  and agent sign-off are required, and high-severity findings resting only on
  low-confidence extraction are demoted to clarifications.
- **Reports** — live severity tiles, category grades always shown with their
  underlying findings, agent-review timeline with sign-off, and a branded
  executive report preview rendered to a downloadable PDF via headless
  Chromium.

## Configuration

`.env` ships with dev-safe defaults. To enable live Claude extraction:

```bash
ANTHROPIC_API_KEY="sk-ant-..."
# optional, defaults to claude-opus-4-8
EXTRACTION_MODEL="claude-opus-4-8"
```

The governing analysis system prompt (extraction rules, citation
requirements, status vocabulary, confidentiality constraints) lives in
`lib/extraction/system-prompt.ts` and is sent verbatim on every extraction.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma + SQLite ·
NextAuth · react-pdf (PDF.js) · Anthropic SDK · Playwright (PDF export).
SQLite and local-disk uploads are v1 conveniences — the Prisma schema and the
storage/provider seams are the swap points for Postgres and S3.
