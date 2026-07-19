import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const doc = await db.document.findUnique({ where: { id: params.id } });
  if (!doc?.filePath) {
    return NextResponse.json({ error: "No file for this document" }, { status: 404 });
  }
  // filePath is always app-managed (data/uploads/...), but resolve defensively.
  const abs = path.resolve(process.cwd(), doc.filePath);
  if (!abs.startsWith(path.resolve(process.cwd(), "data", "uploads"))) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }
  const bytes = await readFile(abs);
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${path.basename(abs)}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
