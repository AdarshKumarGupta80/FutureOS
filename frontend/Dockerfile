# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

ARG VITE_API_BASE=http://localhost:8080/api
ENV VITE_API_BASE=${VITE_API_BASE}

COPY . .
RUN npm run build

# ── Stage 2: serve ──────────────────────────────────────────────────────────
# Use a lightweight static file server instead of the Vite dev server.
# The dev server (npm run dev) is not suitable for production / Docker
# because it rebuilds on every request and does not serve optimised assets.
FROM node:24-alpine AS serve
WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
