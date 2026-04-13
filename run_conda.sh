#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
cd "$SCRIPT_DIR"

CONDA_PATH="$SCRIPT_DIR/miniconda"
if [ ! -f "$CONDA_PATH/etc/profile.d/conda.sh" ]; then
  if [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
    CONDA_PATH="$HOME/miniconda3"
  else
    echo "Miniconda nao encontrada. Execute ./install_conda.sh (esperado em $SCRIPT_DIR/miniconda ou ~/miniconda3)."
    exit 1
  fi
fi

# shellcheck source=/dev/null
source "$CONDA_PATH/etc/profile.d/conda.sh"

export PYTHONWARNINGS=ignore
conda activate crewai_env
export PYTHONWARNINGS=default
unset PYTHONOPTIMIZE

cd "$SCRIPT_DIR"
exec streamlit run app/app.py --server.headless true
