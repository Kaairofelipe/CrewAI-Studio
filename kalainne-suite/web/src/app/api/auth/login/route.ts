import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { email, password } = loginSchema.parse(json);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Credenciais invalidas." },
        { status: 401 },
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "login_failed",
          resource: "auth",
          result: "invalid_password",
        },
      });
      return NextResponse.json(
        { error: "Credenciais invalidas." },
        { status: 401 },
      );
    }

    await createSession({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "login_success",
        resource: "auth",
        result: "ok",
      },
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Payload de login invalido." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Falha ao realizar login." },
      { status: 500 },
    );
  }
}
