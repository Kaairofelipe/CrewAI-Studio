import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getSession();
  if (session) {
    await prisma.auditLog.create({
      data: {
        userId: session.sub,
        action: "logout",
        resource: "auth",
        result: "ok",
      },
    });
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
