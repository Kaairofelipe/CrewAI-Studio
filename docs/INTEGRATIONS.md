# Integrações e variáveis

## CrewAI Studio (Python / Streamlit)

| Variável | Função |
|----------|--------|
| `OPENAI_API_KEY`, `OPENAI_API_BASE` | OpenAI e compatíveis |
| `ANTHROPIC_API_KEY` | Claude |
| `GROQ_API_KEY` | Groq |
| `OLLAMA_HOST` | Ollama (ex.: `http://127.0.0.1:11434`) |
| `LMSTUDIO_API_BASE` | LM Studio |
| `XAI_API_KEY` | xAI Grok |
| `DB_URL` | Opcional: Postgres; sem isso usa SQLite em pasta local (fora do OneDrive no Windows) |
| `AGENTOPS_ENABLED`, `AGENTOPS_API_KEY` | Telemetria opcional |

Ficheiro de exemplo: `.env_example` na raiz (copiar para `.env`).

## Kalaïnne Suite (`kalainne-suite/web`)

| Variável | Função |
|----------|--------|
| `DATABASE_URL` | Postgres (ex.: porta **5433** com `docker-compose.postgres.yml`) |
| `AUTH_SECRET` | JWT da sessão |
| `KALAINNE_TEXT_PROVIDER` | `ollama` ou `gemini` |
| `KALAINNE_IMAGE_PROVIDER` | `gemini` (MVP) |
| `OLLAMA_HOST`, `OLLAMA_MODEL` | Alinhar com o mesmo Ollama do CrewAI Studio, se usar ambos |
| `GEMINI_API_KEY`, `GEMINI_IMAGE_MODEL` | Google Gemini |

Ficheiro: `kalainne-suite/web/.env.example` → `.env.local`.

## Alinhar Ollama entre os dois stacks

Se CrewAI Studio e a suíte web correm na mesma máquina, use o **mesmo** `OLLAMA_HOST` (e modelo coerente) nos dois `.env` para evitar duplicar serviços.
