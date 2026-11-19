#!/usr/bin/env bash
# Static preview build (no server): temporarily sets the API routes aside.
set -euo pipefail
cd "$(dirname "$0")/.."
mv src/app/api .api-static-tmp
trap 'mv .api-static-tmp src/app/api' EXIT
STATIC_EXPORT=1 npx next build --turbopack
