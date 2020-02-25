FROM node:12.16.1-alpine3.11

RUN apk update && apk upgrade && \
    apk add --no-cache git openssh make gcc g++ python

COPY . /app
WORKDIR /app

RUN yarn install
RUN yarn build

RUN apk del make gcc g++ python git openssh

EXPOSE 8000

CMD ["yarn", "serve"]