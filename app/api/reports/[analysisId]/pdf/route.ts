import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright-core";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const maxDuration = 120;

const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";

// Renders the executive report preview to PDF with the requester's own
// session cookies, so auth carries through. Gated: draft reports (no agent
// sign-off) can only be exported by AGENT/ADMIN and are watermarked by the
// preview page itself.
export async function GET(
  req: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const analysis = await db.analysis.findUnique({
    where: { id: params.analysisId },
    include: { practice: true },
  });
  if (!analysis) {
    return NextResponse.json({ error: "Unknown analysis" }, { status: 404 });
  }
  if (!analysis.signedOffAt) {
    return NextResponse.json(
      {
        error:
          "This report has not been signed off by a licensed agent. Sign-off is required before export.",
      },
      { status: 409 }
    );
  }

  const host = req.headers.get("host") ?? "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") ?? "http";
  const url = `${proto}://${host}/reports/preview?print=1`;

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    args: ["--no-sandbox"],
  });
  try {
    const context = await browser.newContext();
    const cookieHeader = req.headers.get("cookie") ?? "";
    await context.addCookies(
      cookieHeader
        .split(";")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => {
          const eq = c.indexOf("=");
          return {
            name: c.slice(0, eq),
            value: c.slice(eq + 1),
            domain: host.split(":")[0],
            path: "/",
          };
        })
    );
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "0.5in", bottom: "0.5in", left: "0.4in", right: "0.4in" },
    });
    const slug = analysis.practice.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="gap-analysis-${slug}.pdf"`,
      },
    });
  } finally {
    await browser.close();
  }
}
