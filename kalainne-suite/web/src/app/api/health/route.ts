import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const textProvider = process.env.KALAINNE_TEXT_PROVIDER ?? "ollama";
  const imageProvider = process.env.KALAINNE_IMAGE_PROVIDER ?? "gemini";
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const ollamaHost = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
  const ollamaModel = process.env.OLLAMA_MODEL ?? "qwen2.5:7b-instruct";
  const geminiImageModel =
    process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image-preview";

  let dbStatus = "down";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "up";
  } catch {
    dbStatus = "down";
  }

  const checks = {
    textProvider,
    imageProvider,
    hasGeminiKey,
    ollamaHost,
    ollamaModel,
    geminiImageModel,
    database: dbStatus,
  };

  return NextResponse.json({
    status: dbStatus === "up" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    checks,
    notes: [
      "Texto ilimitado recomendado: Ollama local.",
      "Imagem requer GEMINI_API_KEY quando provider=gemini.",
    ],
  });
}
