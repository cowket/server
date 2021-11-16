FROM node:14-alpine

WORKDIR /app

COPY ./dist/main.js .

EXPOSE 4000
EXPOSE 4001

ENTRYPOINT [ "npm", "run", "start:prod" ]