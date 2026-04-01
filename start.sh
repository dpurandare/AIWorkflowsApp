#!/bin/bash
set -e

# Resolve project root relative to this script regardless of where it is called from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
DEFAULT_CA_BUNDLE="$BACKEND_DIR/ca-bundle.pem"

# ------------------------------------------------------------------ #
#  Helpers
# ------------------------------------------------------------------ #
setup_python_env() {
  if [ ! -f "$BACKEND_DIR/venv/bin/activate" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv "$BACKEND_DIR/venv"
  fi
  # shellcheck source=/dev/null
  source "$BACKEND_DIR/venv/bin/activate"
  echo "  Installing Python dependencies..."
  pip install -r "$BACKEND_DIR/requirements.txt" -q
}

setup_node_env() {
  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "  Installing frontend dependencies..."
    npm --prefix "$FRONTEND_DIR" install
  fi
}

configure_ssl_env() {
  # If not provided, default to skipping SSL verification (suitable for self-signed dev certs).
  : "${WORKFLOW_VERIFY_SSL:=false}"

  # Prefer an explicitly provided CA bundle; otherwise use a local bundle when available.
  if [[ -z "${WORKFLOW_CA_BUNDLE:-}" && -f "$DEFAULT_CA_BUNDLE" ]]; then
    WORKFLOW_CA_BUNDLE="$DEFAULT_CA_BUNDLE"
  fi

  if [[ -n "${WORKFLOW_CA_BUNDLE:-}" && ! -f "$WORKFLOW_CA_BUNDLE" ]]; then
    echo "  Warning: WORKFLOW_CA_BUNDLE set but file not found: $WORKFLOW_CA_BUNDLE" >&2
    unset WORKFLOW_CA_BUNDLE
  fi

  export WORKFLOW_VERIFY_SSL WORKFLOW_CA_BUNDLE
  echo "  SSL verify: $WORKFLOW_VERIFY_SSL"
  if [[ -n "${WORKFLOW_CA_BUNDLE:-}" ]]; then
    echo "  CA bundle: $WORKFLOW_CA_BUNDLE"
  fi

  return 0
}

# ------------------------------------------------------------------ #
#  Dev mode  (./start.sh --dev)
#  Runs backend (uvicorn --reload) and frontend (vite) concurrently.
#  Ctrl-C shuts down both.
# ------------------------------------------------------------------ #
if [[ "${1:-}" == "--dev" ]]; then
  echo "==> Starting in development mode"
  setup_python_env
  setup_node_env
  configure_ssl_env

  trap 'echo ""; echo "Shutting down..."; kill 0' SIGINT SIGTERM EXIT

  cd "$BACKEND_DIR" && uvicorn main:app --reload --port 8000 &
  npm --prefix "$FRONTEND_DIR" run dev &

  wait
  exit 0
fi

# ------------------------------------------------------------------ #
#  Production mode (default — used by Docker)
#  Builds the frontend into frontend/dist, then serves everything
#  through a single uvicorn process on 0.0.0.0:8000.
# ------------------------------------------------------------------ #
echo "==> Starting in production mode"

setup_node_env
echo "  Building frontend..."
npm --prefix "$FRONTEND_DIR" run build

setup_python_env
configure_ssl_env
echo "  Starting server on 0.0.0.0:8000..."
cd "$BACKEND_DIR"
exec uvicorn main:app --host 0.0.0.0 --port 8000
