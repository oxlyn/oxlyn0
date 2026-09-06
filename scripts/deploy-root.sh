#!/bin/bash
# Build and sync the new desktop into the repo root so the existing
# GitHub Pages (deploy-from-root) flow keeps working unchanged.
# Media (jpg/mp3) already lives at root and is not touched.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

# Deployed artifact overwrites the root entry page; the Vite SOURCE entry lives
# at app/index.html and is never touched by this script.
cp dist/index.html index.html
rm -f assets/index-*.js assets/index-*.css
cp dist/assets/index-*.js dist/assets/index-*.css assets/

echo "✓ Synced dist → repo root. Commit + push to publish to GitHub Pages."
