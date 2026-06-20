#!/bin/sh
PLACEHOLDER="__VITE_API_BASE_PLACEHOLDER__"
REAL_URL="${VITE_API_BASE:-http://localhost:8080/api}"

echo "Setting API base to: $REAL_URL"

# Check if placeholder exists before replacing
echo "Searching for placeholder in JS files..."
grep -rl "$PLACEHOLDER" /app/dist || echo "WARNING: placeholder NOT found in any JS file!"

find /app/dist -name "*.js" -exec sed -i "s|$PLACEHOLDER|$REAL_URL|g" {} +

echo "Done. Verifying replacement..."
grep -r "onrender.com" /app/dist/*.js | head -2 || echo "WARNING: URL not found after replacement"

exec serve -s dist -l 10000