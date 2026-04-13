import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";

const campaignSchema = z.object({
  title: z.string().min(3),
  phase: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  objective: z.string().min(6),
});

export async function GET() {
  const access = await requirePermission("read:campaigns");
  if (!access.ok) {
    return access.response;
  }

  const items = await prisma.campaign.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const access = await requirePermission("write:campaigns");
  if (!access.ok) {
    return access.response;
  }

  try {
    const body = await request.json();
    const payload = campaignSchema.parse(body);
    const item = await prisma.campaign.create({
      data: {
        title: payload.title,
        phase: payload.phase,
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        objective: payload.objective,
        ownerId: access.session.sub,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Payload invalido para campanha." },
      { status: 400 },
    );
  }
}
