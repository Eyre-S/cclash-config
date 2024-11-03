#----------------------------------- dependencies-production
FROM node:23 AS dependencies-production

WORKDIR /build
ARG DOCKER_BUILD=yes

COPY ./package.json ./yarn.lock /build/

RUN yarn --production --frozen-lockfile

#----------------------------------- dependencies
FROM node:23 AS dependencies

WORKDIR /build
ARG DOCKER_BUILD=yes

COPY --from=dependencies-production /build /build

RUN yarn --frozen-lockfile

#----------------------------------- build
FROM node:23 AS build

WORKDIR /build
ARG DOCKER_BUILD=yes

COPY ./ /build/
COPY --from=dependencies /build/node_modules /build/node_modules

RUN yarn build

#----------------------------------- production
FROM node:23-alpine AS production

WORKDIR /app

COPY --from=build /build/build /app/build
COPY --from=build /build/package.json /app/
COPY --from=dependencies-production /build/node_modules /app/node_modules

EXPOSE 3000
VOLUME [ "/app/server" ]
ENTRYPOINT [ "yarn", "start" ]
