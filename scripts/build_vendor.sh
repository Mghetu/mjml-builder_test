#!/usr/bin/env bash
set -euo pipefail

# Always recreate vendor dirs
mkdir -p vendor/grapesjs vendor/mjml-browser

echo "→ Copying GrapesJS assets…"
GJS_JS="node_modules/grapesjs/dist/grapes.min.js"
GJS_CSS="node_modules/grapesjs/dist/css/grapes.min.css"
[ -f "$GJS_JS" ]  || { echo "✗ $GJS_JS not found. Did npm install succeed?"; exit 1; }
[ -f "$GJS_CSS" ] || { echo "✗ $GJS_CSS not found. Did npm install succeed?"; exit 1; }
cp "$GJS_JS"  vendor/grapesjs/grapes.min.js
cp "$GJS_CSS" vendor/grapesjs/grapes.min.css
echo "  ✓ GrapesJS copied"

echo "→ Preparing grapesjs-mjml UMD…"
if [ -f node_modules/grapesjs-mjml/dist/grapesjs-mjml.min.js ]; then
  cp node_modules/grapesjs-mjml/dist/grapesjs-mjml.min.js vendor/grapesjs-mjml.min.js
  echo "  ✓ Copied official UMD"
else
  echo "  ! UMD not found, bundling with esbuild…"
  ENTRY="$(node -p "require.resolve('grapesjs-mjml')")"
  npx esbuild "$ENTRY" --bundle --format=iife --global-name=grapesjsMjml --outfile=vendor/grapesjs-mjml.min.js
  echo "  ✓ Bundled grapesjs-mjml"
fi

echo "→ Bundling mjml-browser to a local vendor IIFE (global: mjml2html)…"
MJML_ENTRY="$(node -p "require.resolve('mjml-browser')")"
npx esbuild "$MJML_ENTRY" --bundle --format=iife --global-name=mjml2html --outfile=vendor/mjml-browser/mjml-browser.js
echo "  ✓ Bundled mjml-browser"

echo "✓ Vendor build complete."
