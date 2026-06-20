# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Placeholder value — will be replaced at runtime by entrypoint.sh
ARG VITE_API_BASE=__VITE_API_BASE_PLACEHOLDER__
ENV VITE_API_BASE=${VITE_API_BASE}

COPY . .
RUN npm run build

RUN echo '/* /index.html 200' > /app/dist/_redirects

# ── Stage 2: serve ──────────────────────────────────────────────────────────
FROM node:24-alpine AS serve
WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

# entrypoint: replace placeholder with real VITE_API_BASE env var, then serve
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 10000

CMD ["./entrypoint.sh"]