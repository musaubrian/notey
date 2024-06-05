ARG NODE_VERSION=20.11.1

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:${NODE_VERSION}-alpine as production

WORKDIR /app

COPY --from=base /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
