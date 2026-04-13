#!/usr/bin/env bash
# Verifica pacotes comuns para build de wheels e desenvolvimento no WSL Ubuntu 24.04
set -euo pipefail

echo "=== CrewAI Studio — checagem de pré-requisitos (WSL/Linux) ==="
echo

missing=0
need() {
  if command -v "$1" >/dev/null 2>&1; then
    echo "[ok] $1"
  else
    echo "[falta] $1"
    missing=1
  fi
}

need wget
need curl
need git
need python3
need gcc

if [ -f /etc/os-release ]; then
  # shellcheck source=/dev/null
  . /etc/os-release
  echo "SO: ${PRETTY_NAME:-unknown}"
fi

echo
if [ "$missing" -eq 1 ]; then
  echo "Instale o que faltar, por exemplo:"
  echo "  sudo apt update && sudo apt install -y build-essential wget curl git python3 python3-venv"
  exit 1
fi

echo "Pronto para ./install_conda.sh ou ./install_venv.sh"
echo "Documentação: docs/WSL_UBUNTU_24_SETUP.md"
