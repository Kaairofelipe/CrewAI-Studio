import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { prisma } from "@/lib/prisma";

export async function requirePermission(permission: string) {
  const session = await getSession();
  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Nao autenticado." }, { status: 401 }),
    };
  }

  if (!hasPermission(session.role, permission)) {
    await prisma.auditLog.create({
      data: {
        userId: session.sub,
        action: "authorization_denied",
        resource: permission,
        result: "forbidden",
      },
    });
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Acesso negado." }, { status: 403 }),
    };
  }

  return { ok: true as const, session };
}
