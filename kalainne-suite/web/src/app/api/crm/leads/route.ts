import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";

const leadSchema = z.object({
  name: z.string().min(2),
  channel: z.string().min(2),
  audience: z.string().min(2),
  notes: z.string().optional(),
});

export async function GET() {
  const access = await requirePermission("read:leads");
  if (!access.ok) {
    return access.response;
  }

  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ items: leads });
}

export async function POST(request: Request) {
  const access = await requirePermission("write:leads");
  if (!access.ok) {
    return access.response;
  }

  try {
    const body = await request.json();
    const payload = leadSchema.parse(body);
    const lead = await prisma.lead.create({
      data: {
        ...payload,
        ownerId: access.session.sub,
      },
    });
    return NextResponse.json({ item: lead }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Payload invalido para lead." },
      { status: 400 },
    );
  }
}
