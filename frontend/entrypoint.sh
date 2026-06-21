#!/bin/sh
REAL_URL="${VITE_API_BASE:-http://localhost:8080/api}"
echo "Setting API base to: $REAL_URL"

# Replace placeholder in index.html (always present, no bunding issues)
find /app/dist -name "index.html" -exec sed -i "s|VITE_API_BASE_PLACEHOLDER|$REAL_URL|g" {} +

echo "Done."
exec serve -s dist -l 10000