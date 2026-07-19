"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth, requireRole } from "@/lib/auth";

export async function decideField(
  fieldId: string,
  decision: "approved" | "edited" | "rejected" | null,
  editedValue?: string
) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");
  await db.extractedField.update({
    where: { id: fieldId },
    data: {
      decision,
      ...(decision === "edited" && editedValue ? { value: editedValue } : {}),
    },
  });
  revalidatePath("/review");
}

export async function setFindingState(
  findingId: string,
  state: "APPROVED" | "DISMISSED" | "PROPOSED"
) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated");
  await db.finding.update({ where: { id: findingId }, data: { state } });
  revalidatePath("/reports");
  revalidatePath("/reports/preview");
  revalidatePath("/review");
}

export async function signOffAnalysis(analysisId: string) {
  const { session } = await requireRole("AGENT", "ADMIN");
  await db.analysis.update({
    where: { id: analysisId },
    data: {
      signedOffAt: new Date(),
      signedOffBy: session.user?.name ?? "Licensed agent",
      stage: "Report drafted",
      progress: 92,
    },
  });
  revalidatePath("/reports");
  revalidatePath("/reports/preview");
}

export async function revokeSignOff(analysisId: string) {
  await requireRole("AGENT", "ADMIN");
  await db.analysis.update({
    where: { id: analysisId },
    data: { signedOffAt: null, signedOffBy: null, stage: "Findings review", progress: 68 },
  });
  revalidatePath("/reports");
  revalidatePath("/reports/preview");
}
