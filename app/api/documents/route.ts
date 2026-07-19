import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { runExtraction } from "@/lib/extraction/run";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const practiceId = form.get("practiceId");
  if (!(file instanceof File) || typeof practiceId !== "string") {
    return NextResponse.json(
      { error: "Expected a PDF file and a practiceId" },
      { status: 400 }
    );
  }
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json(
      { error: "Only PDF policy documents are accepted" },
      { status: 400 }
    );
  }

  const practice = await db.practice.findUnique({ where: { id: practiceId } });
  if (!practice) {
    return NextResponse.json({ error: "Unknown practice" }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  let pages = 0;
  try {
    pages = (await PDFDocument.load(bytes, { ignoreEncryption: true })).getPageCount();
  } catch {
    return NextResponse.json(
      { error: "The file could not be read as a PDF" },
      { status: 400 }
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const relPath = path.join("data", "uploads", `${Date.now()}-${safeName}`);
  await mkdir(path.join(process.cwd(), "data", "uploads"), { recursive: true });
  await writeFile(path.join(process.cwd(), relPath), bytes);

  const doc = await db.document.create({
    data: {
      practiceId,
      name: file.name.replace(/\.pdf$/i, ""),
      type: "Uploaded policy",
      carrier: "—",
      pages,
      completeness: "Complete",
      status: "uploaded",
      filePath: relPath,
    },
  });

  try {
    const result = await runExtraction(doc.id);
    return NextResponse.json({ id: doc.id, extraction: result.provider });
  } catch (err) {
    return NextResponse.json(
      {
        id: doc.id,
        error: `Extraction failed: ${err instanceof Error ? err.message : "unknown error"}`,
      },
      { status: 502 }
    );
  }
}
