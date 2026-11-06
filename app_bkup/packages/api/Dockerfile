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

# Bot .md files are mounted here by docker-compose (read-only).
ENV BOTS_DIR=/bots
ENV API_PORT=8080
EXPOSE 8080

CMD ["npm", "--workspace", "@fleet/api", "run", "start"]
