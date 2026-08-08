#!/usr/bin/env bash
# Local dev runner for The Futbolist
# Usage: ./dev.sh
#
# Starts:
#  - Cloudflare Worker  →  http://localhost:8787
#  - Static site        →  http://localhost:8080
#
# Fill in .dev.vars with real secret values before testing end-to-end.

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Static site ──────────────────────────────────────────────────────────────
if lsof -ti:8080 > /dev/null 2>&1; then
  echo "✓ Static site already running on http://localhost:8080"
else
  echo "→ Starting static site on http://localhost:8080 ..."
  python3 -m http.server 8080 --directory "$ROOT" &
  SITE_PID=$!
  echo "  PID $SITE_PID"
fi

echo ""
echo "→ Starting Cloudflare Worker on http://localhost:8787 ..."
echo "  (wrangler runs in the foreground — press Ctrl-C to stop everything)"
echo ""

cd "$ROOT"
wrangler dev --port 8787 --show-interactive-dev-session=false
