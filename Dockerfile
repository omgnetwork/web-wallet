FROM node:12.16.1-alpine3.11 as build

RUN apk update && apk upgrade && \
    apk add --no-cache git openssh make gcc g++ python

WORKDIR /var/app

COPY package.json /var/app

COPY yarn.lock /var/app

RUN yarn install

ADD . .

RUN yarn build

FROM beamaustralia/react-env:latest

WORKDIR /var/www

COPY --from=build /var/app/build /var/www
