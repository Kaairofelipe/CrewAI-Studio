import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";

type ImagePayload = {
  prompt: string;
  style?: string;
};

export async function POST(request: Request) {
  const access = await requirePermission("execute:ai");
  if (!access.ok) {
    return access.response;
  }

  const body = (await request.json()) as ImagePayload;
  const provider = process.env.KALAINNE_IMAGE_PROVIDER ?? "gemini";
  const geminiImageModel =
    process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image-preview";

  if (!body?.prompt) {
    return NextResponse.json(
      { error: "Campo obrigatorio: prompt." },
      { status: 400 },
    );
  }

  if (provider !== "gemini") {
    return NextResponse.json(
      {
        error:
          "Provider de imagem nao suportado nesta versao. Use KALAINNE_IMAGE_PROVIDER=gemini.",
      },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Defina GEMINI_API_KEY no .env.local." },
      { status: 400 },
    );
  }

  try {
    const finalPrompt = `${body.prompt}. Estilo: ${body.style ?? "luxo editorial premium"}. Marca Kalaïnne Professional, paleta preto profundo, dourado, verde esmeralda, branco acetinado, qualidade fotorealista.`;
    let res: Response;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiImageModel}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        },
      );
    } catch {
      return NextResponse.json(
        {
          error:
            "Falha de conexao com Gemini Image API. Verifique internet/firewall e tente novamente.",
        },
        { status: 503 },
      );
    }

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message ?? "Falha na Gemini Image API." },
        { status: 500 },
      );
    }

    const part = data?.candidates?.[0]?.content?.parts?.find(
      (item: { inlineData?: { data?: string; mimeType?: string } }) =>
        item?.inlineData?.data,
    );

    if (!part?.inlineData?.data) {
      return NextResponse.json(
        { error: "A API respondeu sem imagem." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      provider,
      mimeType: part.inlineData.mimeType ?? "image/png",
      imageBase64: part.inlineData.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado na geracao de imagem.",
      },
      { status: 500 },
    );
  }
}
