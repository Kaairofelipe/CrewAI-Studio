# Modelos IA Gratuitos para o Projeto

## Regra pratica
- `Gratis e ilimitado real`: somente self-hosted (local/servidor proprio).
- `Gratis em nuvem`: normalmente possui limite diario/mensal.

## Texto
- Melhor custo/beneficio imediato:
  - `Ollama + qwen2.5:7b-instruct` (local, ilimitado para uso interno)
- Opcao cloud para fallback:
  - `Gemini Flash` (free tier com limites)

## Imagem
- Para iniciar agora:
  - `Gemini Image API` (free tier)
- Para escala ilimitada:
  - `FLUX` ou `Stable Diffusion` self-hosted via ComfyUI

## Video
- Curto prazo:
  - Fluxo semiautomatico com prompts + edicao para reels/stories
- Escala ilimitada:
  - Pipeline self-hosted de text-to-video (demanda GPU forte)

## Recomendacao executiva
1. Operar texto em `Ollama` para reduzir custo a zero.
2. Operar imagem via `Gemini` no inicio e migrar para `ComfyUI` quando o volume subir.
3. Tratar video como etapa 2 (infra dedicada), sem travar lancamento agora.
