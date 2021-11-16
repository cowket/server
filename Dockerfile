FROM node:14-alpine

WORKDIR /app

COPY package.json .
COPY ./dist/main.js .

RUN npm i -g pm2

EXPOSE 4000
EXPOSE 4001

ENTRYPOINT [ "npm", "run", "start:prod" ]