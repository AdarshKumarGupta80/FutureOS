#!/bin/sh
# Replace the placeholder baked into the JS bundle with the real API URL.
# Render injects VITE_API_BASE as a runtime env var.
PLACEHOLDER="__VITE_API_BASE_PLACEHOLDER__"
REAL_URL="${VITE_API_BASE:-http://localhost:8080/api}"

echo "Setting API base to: $REAL_URL"

# Replace in all built JS files
find /app/dist -name "*.js" -exec sed -i "s|$PLACEHOLDER|$REAL_URL|g" {} +

exec serve -s dist -l 10000