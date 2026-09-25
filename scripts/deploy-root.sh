#!/bin/bash
# Build and sync the new desktop into the repo root so the existing
# GitHub Pages (deploy-from-root) flow keeps working unchanged.
# Media (jpg/mp3) already lives at root and is not touched.
set -euo pipefail
cd "$(dirname "$0")/.."

# Inject <link rel="modulepreload"> for every hashed chunk into dist/index.html.
# Without this, the ~54 app chunks only start downloading after the entry
# bundle has been fetched, parsed and executed (appsReady()); with it, the
# browser fetches them in parallel while still parsing the HTML.
# Idempotent: dist/index.html is regenerated on every build, and the presence
# check guards against double injection when re-running without a rebuild.
inject_preloads() {
  local html="dist/index.html"
  if grep -q 'rel="modulepreload"' "$html"; then
    echo "• modulepreload links already present — skip"
    return 0
  fi
  # Derive the base path ("/macos27/" on Pages, "/" on root-hosted builds)
  # from the entry script instead of assuming it.
  local base
  base=$(sed -n 's/.*src="\([^"]*\)assets\/index-[^"]*\.js".*/\1/p' "$html" | head -1)
  if [[ -z "$base" ]]; then
    echo "⚠ entry bundle not found in $html — skip preload injection"
    return 0
  fi
  local links=""
  local f name
  for f in dist/assets/*.js; do
    name="${f##*/}"
    # The entry bundle is loaded by its own <script type="module"> — skip it.
    [[ "$name" == index-* ]] && continue
    links+="    <link rel=\"modulepreload\" crossorigin href=\"${base}assets/${name}\">"$'\n'
  done
  # BSD awk (macOS) rejects newlines in -v values — pass via the environment.
  LINKS="$links" awk '/<script type="module"/ && !done { printf "%s", ENVIRON["LINKS"]; done=1 } { print }' \
    "$html" > "$html.tmp"
  mv "$html.tmp" "$html"
  echo "• injected $(grep -c 'rel="modulepreload"' "$html") modulepreload links (base \"${base}\")"
}

npm run build
inject_preloads

# Deployed artifact overwrites the root entry page; the Vite SOURCE entry lives
# at app/index.html and is never touched by this script.
rm -rf assets
mkdir assets
cp dist/index.html index.html
# App modules are code-split into one chunk each, so copy every hashed asset
# (index-* is no longer the only pattern) instead of just the entry bundle.
cp dist/assets/* assets/

echo "✓ Synced dist → repo root. Commit + push to publish to GitHub Pages."
