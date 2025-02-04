FROM node:23 AS base
RUN corepack enable
WORKDIR /app

FROM base AS builder
RUN npm add -g turbo
COPY . .
RUN turbo prune @bitlerjs/nexus-demo-backend --docker

FROM base AS installer
ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=${NODE_AUTH_TOKEN}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm add -g turbo
COPY --from=builder /app/out/json/ .
RUN \
  --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile
COPY --from=builder /app/out/full .
RUN pnpm build

FROM node:23
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV DATA_DIR=/data
COPY --from=installer /app /app
WORKDIR /app/demo/backend
CMD ["npm", "start"]
