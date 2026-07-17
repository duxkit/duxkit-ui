#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="$(tr -d '[:space:]' < "$ROOT_DIR/.nvmrc")"

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  unset npm_config_prefix
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  if ! nvm which "$NODE_VERSION" >/dev/null 2>&1; then
    nvm install "$NODE_VERSION" >/dev/null
  fi
  NODE_BIN="$(dirname "$(nvm which "$NODE_VERSION")")"
  export PATH="$NODE_BIN:$PATH"
fi

exec "$@"
