import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";

const scriptSchema = z.object({
  audience: z.string().min(2),
  title: z.string().min(3),
  objective: z.string().min(3),
  content: z.string().min(10),
});

export async function GET() {
  const access = await requirePermission("read:scripts");
  if (!access.ok) {
    return access.response;
  }

  const items = await prisma.scriptTemplate.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const access = await requirePermission("write:scripts");
  if (!access.ok) {
    return access.response;
  }

  try {
    const body = await request.json();
    const payload = scriptSchema.parse(body);
    const item = await prisma.scriptTemplate.create({
      data: payload,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Payload invalido para script." },
      { status: 400 },
    );
  }
}
