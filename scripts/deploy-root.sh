#!/bin/bash
# Build and sync the new desktop into the repo root so the existing
# GitHub Pages (deploy-from-root) flow keeps working unchanged.
# Media (jpg/mp3) already lives at root and is not touched.
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build

# Deployed artifact overwrites the root entry page; the Vite SOURCE entry lives
# at app/index.html and is never touched by this script.
rm -rf assets
mkdir assets
cp dist/index.html index.html
# App modules are code-split into one chunk each, so copy every hashed asset
# (index-* is no longer the only pattern) instead of just the entry bundle.
cp dist/assets/* assets/

echo "✓ Synced dist → repo root. Commit + push to publish to GitHub Pages."
