# Frontend (Vite + React + Nginx)

Standalone repo for the SPA and `web` Docker image.

## Local

```bash
npm ci
npm run dev
```

## Docker image (same as CI)

```bash
cp .env.example .env
docker compose up -d --build
# http://localhost/ — expects resolvable host `api-gateway` for /api unless you change nginx/env
```

## GitLab CI

`.gitlab-ci.yml` builds and pushes image `web` to this project’s Container Registry.

## Pair with backend repo

- Build with `VITE_API_BASE_URL` pointing at the **public** API base URL if the browser talks to the gateway directly (e.g. Vercel).
- Extend **CORS** `allowedOriginPatterns` on the backend `api-gateway` for your frontend origin (`api-gateway/.../application.yml` in the backend repo).

**`deploy/fe/`** holds `Dockerfile.web` and `nginx/edge.conf`. The default `api-gateway` hostname only works when this container shares a Docker network with the backend stack.
