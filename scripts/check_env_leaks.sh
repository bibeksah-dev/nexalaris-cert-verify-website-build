#!/usr/bin/env bash
set -euo pipefail

# This script fails if it finds potential privileged keys exposed via NEXT_PUBLIC
# or if the SUPABASE_SERVICE_ROLE_KEY literal appears in the repository.

matches=$(git grep -nE 'NEXT_PUBLIC_[A-Z0-9_]*SERVICE_ROLE|NEXT_PUBLIC_[A-Z0-9_]*SERVICE_ROLE_KEY|SUPABASE_SERVICE_ROLE_KEY' -- . || true)
if [ -n "$matches" ]; then
  echo "Potential privileged key exposure found in repository:"
  echo "$matches"
  echo "\nIf any of these are false positives, review and whitelist intentionally public values in the CI workflow or remove the values." >&2
  exit 1
fi

echo "No exposed service-role patterns found."
