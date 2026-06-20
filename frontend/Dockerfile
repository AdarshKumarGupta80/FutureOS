# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG VITE_API_BASE=http://localhost:8080/api
ENV VITE_API_BASE=${VITE_API_BASE}

COPY . .
RUN npm run build

# Add SPA fallback so React Router works on page refresh
RUN echo '/* /index.html 200' > /app/dist/_redirects

# ── Stage 2: serve ──────────────────────────────────────────────────────────
FROM node:24-alpine AS serve
WORKDIR /app

RUN npm install -g serve@14

COPY --from=build /app/dist ./dist

EXPOSE 10000

CMD ["serve", "-s", "dist", "-l", "10000"]