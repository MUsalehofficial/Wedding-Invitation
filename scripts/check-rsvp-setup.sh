#!/usr/bin/env bash
# Sanity-check local RSVP env before `npm run dev` / manual deploy (does not touch Supabase Dashboard).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ok=1
warn() { echo ":: $*"; ok=0; }

if [[ ! -f .env ]]; then
  echo "Missing .env — cp .env.example .env && fill values"
  exit 1
fi
# shellcheck disable=SC1091
set -a && source .env && set +a

if [[ -z "${SUPABASE_PROJECT_REF:-}" || "$SUPABASE_PROJECT_REF" =~ ^(YOUR_PROJECT_REF|REPLACE_WITH_YOUR_PROJECT_REF)$ ]]; then
  warn "SUPABASE_PROJECT_REF is unset or still a placeholder (Dashboard → General → Reference ID)."
fi

if [[ -z "${VITE_SUPABASE_URL:-}" ]]; then
  warn "VITE_SUPABASE_URL is unset (Dashboard → API → Project URL)."
fi

if [[ -z "${VITE_SUPABASE_PUBLISHABLE_KEY:-}" ]]; then
  warn "VITE_SUPABASE_PUBLISHABLE_KEY is unset (Dashboard → API → anon public)."
fi

if [[ $ok -eq 1 ]]; then
  echo "Local RSVP env looks ready (Edge secrets GOOGLE_* / RSVP_* must still be set in Supabase)."
  exit 0
fi

echo ""
echo "Fix .env then: npm run supabase:sync-ref && npm run deploy:submit-rsvp"
exit 1
