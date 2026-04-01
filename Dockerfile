FROM node:lts-alpine AS base

FROM base AS deps

WORKDIR /app

COPY package.json yarn.lock* ./.yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install --immutable

FROM deps AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG env

RUN yarn build:${env}

FROM builder AS runner
WORKDIR /app

ARG env

COPY --from=builder  /app/public ./public
COPY --from=builder  /app/.env.${env} ./
COPY --from=builder  /app/.env.local ./
COPY --from=builder  /app/.next ./.next

EXPOSE 8080


CMD ["yarn", "start"]
