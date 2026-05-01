#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

print_step() {
  printf '\n==> %s\n' "$1"
}

have_command() {
  command -v "$1" >/dev/null 2>&1
}

clean_semver() {
  printf '%s' "$1" | sed -E 's/^[~^]//'
}

extract_first_major() {
  local range="$1"
  local first_major
  first_major="$(printf '%s' "$range" | grep -Eo '[0-9]+' | head -n 1 || true)"

  if [[ -z "$first_major" ]]; then
    first_major="22"
  fi

  printf '%s' "$first_major"
}

install_node_with_nvm() {
  local target_major="$1"

  if ! have_command nvm; then
    return 1
  fi

  print_step "Installing Node ${target_major}.x with nvm"
  nvm install "$target_major"
  nvm use "$target_major"
}

ensure_node_available() {
  if have_command node && have_command npm; then
    return 0
  fi

  print_step "Node.js was not found; attempting automatic installation"

  # Try nvm first if available in current shell.
  if install_node_with_nvm 22; then
    return 0
  fi

  # If nvm command is unavailable, try loading it from common path.
  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
    if install_node_with_nvm 22; then
      return 0
    fi
  fi

  echo "Error: Unable to install Node.js automatically."
  echo "Install nvm, then rerun this script."
  exit 1
}

get_required_angular_cli_range() {
  local cli_range
  cli_range="$(grep -E '"@angular/cli"\s*:' package.json | head -n 1 | sed -E 's/.*"@angular\/cli"\s*:\s*"([^"]+)".*/\1/')"

  if [[ -z "$cli_range" ]]; then
    echo "Error: Could not read @angular/cli version from package.json"
    exit 1
  fi

  printf '%s' "$cli_range"
}

get_required_node_range_from_cli() {
  local cli_version="$1"
  local node_range

  node_range="$(npm view "@angular/cli@${cli_version}" engines.node --json 2>/dev/null | tr -d '"')"

  if [[ -z "$node_range" ]]; then
    echo "Warning: Could not fetch Node engine requirement for @angular/cli@${cli_version}."
    node_range=">=22"
  fi

  printf '%s' "$node_range"
}

version_satisfies_range() {
  local version="$1"
  local range="$2"

  npx -y semver -r "$range" "$version" >/dev/null 2>&1
}

ensure_node_matches_requirement() {
  local required_node_range="$1"
  local current_node_version
  local current_node_major

  current_node_version="$(node -v | sed 's/^v//')"
  current_node_major="${current_node_version%%.*}"

  if [[ "$current_node_major" -ge 21 ]]; then
    print_step "Node.js ${current_node_version} is >= 21; skipping Node installation"
    return 0
  fi

  if version_satisfies_range "$current_node_version" "$required_node_range"; then
    print_step "Node.js ${current_node_version} satisfies requirement ${required_node_range}"
    return 0
  fi

  local target_major
  target_major="$(extract_first_major "$required_node_range")"

  print_step "Node.js ${current_node_version} does not satisfy ${required_node_range}"

  if install_node_with_nvm "$target_major"; then
    return 0
  fi

  if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "$HOME/.nvm/nvm.sh"
    if install_node_with_nvm "$target_major"; then
      return 0
    fi
  fi

  echo "Error: Could not install a Node.js version matching ${required_node_range}."
  echo "Install nvm, then rerun this script."
  exit 1
}

install_dependencies() {
  print_step "Installing dependencies"

  if [[ -f package-lock.json ]]; then
    npm install
    return 0
  fi

  npm install
}

verify_angular_cli() {
  local required_cli_range="$1"
  local installed_cli_version
  local minimum_supported_cli_range=">=21.0.0"

  installed_cli_version="$(npm list -g @angular/cli --depth=0 --json 2>/dev/null | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).dependencies?.['@angular/cli']?.version || ''" 2>/dev/null || true)"

  if [[ -z "$installed_cli_version" ]]; then
    print_step "Global @angular/cli not found; installing globally"
    npm install -g "@angular/cli"
  else
    print_step "Found global @angular/cli ${installed_cli_version}"
  fi

  print_step "Project toolchain check complete"
  npx ng version
}

main() {
  print_step "Bootstrapping local environment"

  ensure_node_available

  local required_cli_range
  required_cli_range="$(get_required_angular_cli_range)"

  local cli_version_for_lookup
  cli_version_for_lookup="$(clean_semver "$required_cli_range")"

  local required_node_range
  required_node_range="$(get_required_node_range_from_cli "$cli_version_for_lookup")"

  ensure_node_matches_requirement "$required_node_range"
  install_dependencies
  verify_angular_cli "$required_cli_range"

  print_step "Done. You can now run: npm start"
}

main
