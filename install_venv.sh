#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
cd "$SCRIPT_DIR"

prompt_yes_no() {
  while true; do
    read -r -p "$1 (y/n): " yn
    case $yn in
    [Yy]*) return 0 ;;
    [Nn]*) return 1 ;;
    *) echo "Responda y ou n." ;;
    esac
  done
}

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 nao encontrado. No Ubuntu 24.04: sudo apt install -y python3 python3-venv"
  exit 1
fi

if [ -d "venv" ]; then
  if prompt_yes_no "A pasta venv ja existe. Remover e reinstalar?"; then
    rm -rf venv
  else
    echo "Instalacao cancelada."
    exit 0
  fi
fi

python3 -m venv venv
# shellcheck source=/dev/null
source venv/bin/activate

USE_CACHE="--no-cache"
if prompt_yes_no "Usar cache do pip na instalacao?"; then
  USE_CACHE=""
fi

pip install --upgrade pip
pip install -r requirements.txt $USE_CACHE

echo "Instalar agentops opcional? (y/n)"
read -r agentops
if [ "$agentops" = "y" ] || [ "$agentops" = "Y" ]; then
  pip install agentops
fi

if [ ! -f "$SCRIPT_DIR/.env" ]; then
  cp "$SCRIPT_DIR/.env_example" "$SCRIPT_DIR/.env"
fi

echo "OK. Execute: ./run_venv.sh"
