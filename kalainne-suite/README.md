# Kalaïnne Launch OS

Documentação geral do monorepo (disco, WSL, integrações): [../docs/README.md](../docs/README.md).

Suite profissional com:
- `web/` painel operacional de lancamento (Next.js)
- `desktop/` aplicativo desktop (Electron) conectado ao painel web local

## O que ja esta pronto
- Dashboard executivo com KPIs e progresso operacional
- Checklist de execucao por fase
- Biblioteca inicial de scripts B2C/B2B
- Gerador de texto com IA (B2C/B2B)
- Gerador de imagem com IA
- Tema visual premium alinhado a paleta Kalaïnne

## Setup rapido (uso imediato)

### 0) Subir PostgreSQL local
```bash
cd kalainne-suite
docker compose -f docker-compose.postgres.yml up -d
```

### 1) Subir o web
```bash
cd kalainne-suite/web
copy .env.example .env.local
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Abrir em `http://localhost:3000`.

### 2) Subir o desktop
Com o web rodando:
```bash
cd kalainne-suite/desktop
npm install
npm run dev
```

## Validacao rapida de ambiente
- Healthcheck do backend:
  - `http://localhost:3000/api/health`
- Resultado esperado:
  - `status: "ok"` ou `degraded` com resumo de providers/configuracoes e banco.

## Login inicial (auth local temporaria)
- URL: `http://localhost:3000/login`
- Usuario seed: `admin@kalainne.local`
- Senha seed: `Kalainne@2026`

## Abas enterprise disponiveis
- `Executive`
- `CRM`
- `Campaigns`
- `Scripts`
- `PromptStudio`
- `ClaimsGuard`
- `BrandVault`
- `ConsultorOps`
- `Automations`

## IA: gratis e ilimitado (estrategia recomendada)

### Texto
- `Ilimitado local`: Ollama com modelos open-source (ex.: `qwen2.5:7b-instruct`)
- `Gratis com limite`: Gemini Flash

Variaveis:
- `KALAINNE_TEXT_PROVIDER=ollama` (recomendado)
- `OLLAMA_HOST=http://127.0.0.1:11434`
- `OLLAMA_MODEL=qwen2.5:7b-instruct`

### Imagem
- `Gratis com limite`: Gemini Image API (configurada neste MVP)
- `Ilimitado local`: FLUX/Stable Diffusion via ComfyUI (proxima etapa)

Variaveis:
- `KALAINNE_IMAGE_PROVIDER=gemini`
- `GEMINI_API_KEY=...`
- `GEMINI_IMAGE_MODEL=gemini-2.5-flash-image-preview`

### Video
- Estrutura pronta para integrar fila de render
- Recomendacao proxima fase: pipeline local de text-to-video e export para reels/stories

## Roadmap de continuidade (pos uso imediato)
1. Persistencia (PostgreSQL + historico de campanhas)
2. Claims Guard (classificacao Seguro/Validar/Evitar por evidencias INCI)
3. Orquestracao de automacoes (n8n + jobs)
4. Empacotamento instalavel do desktop (Windows installer)
