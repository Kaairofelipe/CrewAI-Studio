import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guards";

type TextPayload = {
  task: string;
  audience: "B2C" | "B2B";
  context?: string;
};

const systemPrompt =
  "Voce e um especialista de lancamento premium da Kalaïnne. Separe tom B2C e B2B. Nunca invente claims sem evidencia tecnica. Entregue texto objetivo e acionavel em portugues.";

export async function POST(request: Request) {
  const access = await requirePermission("execute:ai");
  if (!access.ok) {
    return access.response;
  }

  const body = (await request.json()) as TextPayload;
  const provider = process.env.KALAINNE_TEXT_PROVIDER ?? "ollama";

  if (!body?.task || !body?.audience) {
    return NextResponse.json(
      { error: "Campos obrigatorios: task e audience." },
      { status: 400 },
    );
  }

  try {
    if (provider !== "ollama" && provider !== "gemini") {
      return NextResponse.json(
        {
          error:
            "Provider de texto invalido. Use KALAINNE_TEXT_PROVIDER=ollama ou gemini.",
        },
        { status: 400 },
      );
    }

    if (provider === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "Defina GEMINI_API_KEY no .env.local." },
          { status: 400 },
        );
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nPublico: ${body.audience}\nTarefa: ${body.task}\nContexto: ${body.context ?? "Nao informado"}`,
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message ?? "Falha na Gemini API." },
          { status: 500 },
        );
      }

      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return NextResponse.json({ provider, output });
    }

    const ollamaHost = process.env.OLLAMA_HOST ?? "http://127.0.0.1:11434";
    const ollamaModel = process.env.OLLAMA_MODEL ?? "qwen2.5:7b-instruct";
    const prompt = `${systemPrompt}\n\nPublico: ${body.audience}\nTarefa: ${body.task}\nContexto: ${body.context ?? "Nao informado"}`;

    let res: Response;
    try {
      res = await fetch(`${ollamaHost}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel,
          prompt,
          stream: false,
        }),
      });
    } catch {
      return NextResponse.json(
        {
          error:
            "Nao foi possivel conectar ao Ollama. Inicie o Ollama local e verifique OLLAMA_HOST/OLLAMA_MODEL no .env.local.",
        },
        { status: 503 },
      );
    }

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error ?? "Falha no Ollama local." },
        { status: 500 },
      );
    }

    return NextResponse.json({ provider, output: data?.response ?? "" });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro inesperado na geracao de texto.",
      },
      { status: 500 },
    );
  }
}
