# Espaço em disco e instalação

Medições reais no repositório (Windows, Python 3.11, `pip install -r requirements.txt` completo):

| Componente | Tamanho aproximado | Notas |
|------------|-------------------|--------|
| **`venv/` completo** | **~2,1 GB** | Inclui `Scripts`, `Lib`, etc. |
| **`venv/Lib/site-packages`** | **~2,0 GB** | Maior parte do peso (torch, transformers, docling, chromadb, etc.) |
| **`kalainne-suite/web/node_modules`** | **~0,65–0,70 GB** | Após `npm ci` / `npm install` |
| **Miniconda3 (só instalador + base)** | **~0,4–0,8 GB** | Se usar `./miniconda/` no projeto (Linux/WSL) |
| **Ambiente Conda `crewai_env`** | **~2 GB** | Ordem de grandeza igual ao `venv` se instalar o mesmo `requirements.txt` |

**Total típico “CrewAI Studio + Kalaïnne web” (venv + node, sem duplicar Conda): ~2,8–3,5 GB.**

Limite de **15 GB**: o conjunto completo **cabe com folga**. Reserve espaço extra para:

- cache do pip (`%LocalAppData%\pip\Cache` no Windows, `~/.cache/pip` no Linux);
- builds e `.next` da suíte Next.js;
- imagens Docker e volumes Postgres.

## Política recomendada

1. **Use um único ambiente Python por máquina** para este repo: ou `venv/` **ou** Conda `crewai_env`, não os dois com o mesmo `requirements.txt` (evita ~4 GB duplicados).
2. **WSL/Linux**: prefira clone em `~/src/...` (veja [WSL_UBUNTU_24_SETUP.md](./WSL_UBUNTU_24_SETUP.md)).
3. **Atualizar dependências**: após alterar `requirements.txt`, rode `pip install -r requirements.txt` (ou recrie o venv se houver conflitos).

## Dependência Snowflake

A versão `snowflake-connector-python==4.1.0` foi **retirada (yanked)** no PyPI. O projeto usa **`4.2.0`** ou superior conforme `requirements.txt` atual.
