FROM node:24-alpine
WORKDIR /app

# Install workspace dependencies first (better layer caching).
# npm ci at the root installs every workspace from the single lockfile.
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/engine/package.json ./packages/engine/package.json
COPY packages/api/package.json ./packages/api/package.json
COPY packages/web/package.json ./packages/web/package.json
RUN npm ci

COPY . .

# Production API address (API_URL in app/.env, passed by Compose as a
# build arg). Vite bakes VITE_* values into the static bundle at build
# time, so this must be set BEFORE the build below — and changing
# API_URL later requires rebuilding this image, not just restarting.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Phase 8 — public showcase flavor. VITE_SHOWCASE=1 (set by the
# Compose `showcase` service) builds the read-only entry instead
# (index-showcase.html → ShowcaseApp): no kill switch, no mode
# switch, no WebSocket — it polls a published snapshot file.
# VITE_SNAPSHOT_URL overrides where that file is fetched from
# (default: relative "snapshot.json" served beside the page).
ARG VITE_SHOWCASE=""
ARG VITE_SNAPSHOT_URL=""
ENV VITE_SHOWCASE=$VITE_SHOWCASE
ENV VITE_SNAPSHOT_URL=$VITE_SNAPSHOT_URL

# Build the static frontend, then serve it with vite preview.
RUN if [ "$VITE_SHOWCASE" = "1" ]; then npm run build:showcase --workspace @fleet/web; else npm run build --workspace @fleet/web; fi
EXPOSE 4173

CMD ["npm", "--workspace", "@fleet/web", "run", "preview"]
