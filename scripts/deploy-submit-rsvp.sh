#!/usr/bin/env bash
# Deploy Edge function to YOUR Supabase project (not Lovable’s org).
# Set SUPABASE_PROJECT_REF to the "Reference ID" from Dashboard → Project Settings → General.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REF="${SUPABASE_PROJECT_REF:-}"
if [[ -z "$REF" && -f .env ]]; then
  # shellcheck disable=SC1091
  set -a && source .env && set +a || true
  REF="${SUPABASE_PROJECT_REF:-}"
fi

if [[ -z "$REF" || "$REF" == "REPLACE_WITH_YOUR_PROJECT_REF" ]]; then
  echo "Set SUPABASE_PROJECT_REF in .env (or export it) to your project ref, e.g. abcdwxyz1234"
  echo "Find it: Supabase Dashboard → your project → Project Settings → General → Reference ID"
  exit 1
fi

exec npx --yes supabase@latest functions deploy submit-rsvp --project-ref "$REF"
