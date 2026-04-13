#!/usr/bin/env bash
set -euo pipefail

# CrewAI Studio — Miniconda install (Linux / WSL Ubuntu 24.04+)
# Ambiente: crewai_env (alinhado ao install_conda.bat no Windows)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
cd "$SCRIPT_DIR"

CONDA_PATH="${CONDA_PATH:-$SCRIPT_DIR/miniconda}"
INSTALLER_URL="${MINICONDA_INSTALLER_URL:-https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh}"

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

if ! command -v wget >/dev/null 2>&1 && ! command -v curl >/dev/null 2>&1; then
  echo "Instale wget ou curl (ex.: sudo apt install -y wget)."
  exit 1
fi

if [ ! -d "$CONDA_PATH" ]; then
  echo "Miniconda nao encontrada em $CONDA_PATH. Baixando instalador..."
  TMP_INSTALLER="$SCRIPT_DIR/miniconda_installer.sh"
  if command -v wget >/dev/null 2>&1; then
    wget -q "$INSTALLER_URL" -O "$TMP_INSTALLER"
  else
    curl -fsSL "$INSTALLER_URL" -o "$TMP_INSTALLER"
  fi
  bash "$TMP_INSTALLER" -b -p "$CONDA_PATH"
  rm -f "$TMP_INSTALLER"
else
  echo "Miniconda ja existe em $CONDA_PATH. Pulando download."
fi

if [ ! -f "$CONDA_PATH/etc/profile.d/conda.sh" ]; then
  echo "ERRO: conda.sh nao encontrado em $CONDA_PATH/etc/profile.d/conda.sh"
  exit 1
fi

# shellcheck source=/dev/null
source "$CONDA_PATH/etc/profile.d/conda.sh"

ENV_NAME="crewai_env"

if conda env list | grep -qE "^[[:space:]]*${ENV_NAME}[[:space:]]"; then
  if prompt_yes_no "O ambiente Conda '${ENV_NAME}' ja existe. Remover e reinstalar?"; then
    echo "Removendo ambiente existente..."
    conda remove --name "$ENV_NAME" --all -y
  else
    echo "Instalacao cancelada."
    exit 0
  fi
fi

echo "Criando ambiente ${ENV_NAME} (Python 3.11)..."
conda create -n "$ENV_NAME" python=3.11 -y

USE_CACHE="--no-cache"
if prompt_yes_no "Usar cache do pip na instalacao? (mais rapido se ja instalou antes)"; then
  USE_CACHE=""
fi

conda run -n "$ENV_NAME" conda install -y packaging
conda run -n "$ENV_NAME" pip install -r requirements.txt $USE_CACHE

echo "Instalar agentops opcional? (y/n)"
read -r agentops
if [ "$agentops" = "y" ] || [ "$agentops" = "Y" ]; then
  conda run -n "$ENV_NAME" pip install agentops
fi

if [ ! -f "$SCRIPT_DIR/.env" ]; then
  echo "Criando .env a partir de .env_example..."
  cp "$SCRIPT_DIR/.env_example" "$SCRIPT_DIR/.env"
fi

echo ""
echo "OK. Ambiente: ${ENV_NAME} | Python: 3.11"
echo "Edite .env com suas chaves e execute: ./run_conda.sh"
