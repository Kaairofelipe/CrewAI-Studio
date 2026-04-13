# CrewAI Studio + Kalaïnne Suite — WSL2 Ubuntu 24.04

Guia para máximo desempenho (I/O no filesystem Linux, não em `/mnt/c`), integrações estáveis e Miniconda3 no projeto.

Tamanhos aproximados de disco: [DISK_AND_INSTALL.md](./DISK_AND_INSTALL.md).

## 1. Pré-requisitos no WSL

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl wget git ca-certificates \
  libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
```

- **Python do sistema**: opcional; o fluxo recomendado usa **Miniconda** no repositório (`./miniconda/`), ignorando o `python3` do Ubuntu para o app.
- **Node.js (Kalaïnne Suite)**: instale LTS (20 ou 22), por exemplo via [NodeSource](https://github.com/nodesource/distributions) ou `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# reinicie o shell, depois:
nvm install 22
nvm use 22
```

## 2. Onde clonar o repositório

- **Evite** desenvolver em `/mnt/c/Users/...` (I/O lento, locks SQLite piores).
- **Prefira** `~/src` ou `~/projects` dentro do filesystem WSL, por exemplo:

```bash
mkdir -p ~/src && cd ~/src
git clone <seu-fork-ou-repo> CrewAI-Studio
cd CrewAI-Studio
```

## 3. CrewAI Studio (Python) — Miniconda3

O ambiente Conda tem o nome **`crewai_env`** (igual ao Windows), Python **3.11**.  
Se você instalou antes com o script antigo (ambiente `crewai`), remova-o ou ignore: `conda env remove -n crewai --all -y` e rode `./install_conda.sh` de novo.

Instalador alternativo (ex.: **ARM64** no WSL): defina antes de instalar:

`export MINICONDA_INSTALLER_URL=https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-aarch64.sh`

```bash
chmod +x install_conda.sh run_conda.sh
./install_conda.sh
```

Edite `.env` (criado a partir de `.env_example` se não existir) com suas chaves.

**Executar o Streamlit:**

```bash
./run_conda.sh
```

Abra `http://localhost:8501` no navegador do Windows (WSL expõe a mesma máquina).

### Variáveis úteis (desempenho / depuração)

| Variável        | Uso |
|----------------|-----|
| `PYTHONOPTIMIZE` | Deixe **vazio** ao rodar Streamlit (os scripts já limpam). |
| `DB_URL`       | Opcional: Postgres em vez de SQLite padrão (ver `.env_example`). |

SQLite do projeto usa pasta em `~/.crewai-studio` ou `%LOCALAPPDATA%` — em WSL Linux, `~/.crewai-studio` (fora de pastas sincronizadas com OneDrive).

## 4. Alternativa: venv (sem Conda)

```bash
chmod +x install_venv.sh run_venv.sh
sudo apt install -y python3.12-venv
./install_venv.sh
./run_venv.sh
```

## 5. Kalaïnne Suite (Next.js + Postgres)

Na raiz do repositório:

```bash
cd kalainne-suite
docker compose -f docker-compose.postgres.yml up -d
cd web
cp .env.example .env.local   # ajuste DATABASE_URL, AUTH_SECRET, etc.
npm ci
npm run db:generate && npm run db:migrate && npm run db:seed
npm run dev
```

`DATABASE_URL` típico com o compose da suíte (porta **5433** no host):

`postgresql://kalainne:kalainne123@127.0.0.1:5433/kalainne`

## 6. Checklist de integração

| Item | Raiz Python | Kalaïnne `web/` |
|------|-------------|-----------------|
| Porta dev | 8501 | 3000 |
| Banco padrão | SQLite em `~/.crewai-studio` | Postgres (Prisma) |
| LLM | `.env` / Streamlit | `KALAINNE_*`, Ollama/Gemini |

Unifique **Ollama** em um único host (`OLLAMA_HOST` no Python e no `.env.local` da suíte) se usar os dois lados no mesmo WSL.

## 7. Problemas comuns

- **pip falha compilando wheels**: garanta `build-essential` e os *-dev* da seção 1.
- **Miniconda em ARM (WSL em Surface/ARM)**: o instalador padrão do script é `Linux-x86_64`; em aarch64 use o instalador `Miniconda3-latest-Linux-aarch64.sh` e aponte `MINICONDA_INSTALLER_URL` se o script suportar (ou instale manualmente em `./miniconda`).
- **Streamlit não abre**: confira firewall do Windows para WSL; teste `curl -sI http://127.0.0.1:8501` dentro do WSL.
