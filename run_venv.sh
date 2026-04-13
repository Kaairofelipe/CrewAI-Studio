#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f "$SCRIPT_DIR/venv/bin/activate" ]; then
  echo "Ambiente venv nao encontrado. Execute ./install_venv.sh primeiro."
  exit 1
fi

# shellcheck source=/dev/null
source "$SCRIPT_DIR/venv/bin/activate"

unset PYTHONOPTIMIZE

cd "$SCRIPT_DIR"
exec streamlit run app/app.py --server.headless true
