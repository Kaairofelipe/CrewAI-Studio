import { NextResponse } from "next/server";
import { z } from "zod";
import { ClaimStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";

const claimSchema = z.object({
  productLine: z.string().min(2),
  claimText: z.string().min(4),
  status: z.enum([ClaimStatus.seguro, ClaimStatus.validar, ClaimStatus.evitar]),
  evidenceRef: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const access = await requirePermission("read:claims");
  if (!access.ok) {
    return access.response;
  }

  const items = await prisma.claimRule.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const access = await requirePermission("write:claims");
  if (!access.ok) {
    return access.response;
  }

  try {
    const body = await request.json();
    const payload = claimSchema.parse(body);
    const item = await prisma.claimRule.create({ data: payload });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Payload invalido para claim." },
      { status: 400 },
    );
  }
}
