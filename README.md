# Insurance by Dentists — Risk Analysis Platform

Internal desktop-style application for insurance professionals at Insurance by
Dentists. The platform supports uploading dental-practice insurance policies,
verifying extracted coverage information against the policy's own language, and
producing a practice-ready insurance gap-analysis report.

## Screens

- **Dashboard** — analyses in progress, findings awaiting review, activity.
- **Practices** — client dental practices and their analysis status.
- **Document Review** — the core three-column workspace: uploaded documents and
  page navigation (left), the policy viewer with highlighted source language
  and page-level citations (center), and extracted fields with confidence
  indicators, approve/edit/reject controls, related dental-risk rules and the
  proposed finding (right).
- **Gap Analyses** — pipeline view from extraction through delivery.
- **Reports** — the report dashboard (critical/important findings,
  clarifications, strengths, documents reviewed, progress, agent review
  status) plus a branded executive-report preview.
- **Dental Risk Library** — the dental-specific knowledge base behind findings.
- **Rules** — the analysis rules that propose findings (never auto-publish).
- **Settings** — workflow controls, report branding, team & access, intake.

## Status system

Findings and fields use six accessible statuses: Confirmed, Potential gap,
Limitation, Missing information, Requires confirmation, Not applicable.
Category grades are directional and always shown with their underlying
findings — the analysis is never reduced to a single score.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS. Static sample data lives
in `lib/data.ts`. Optimized for a 1440px desktop display.

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
```
