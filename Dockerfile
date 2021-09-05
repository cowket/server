FROM node:14-alpine
WORKDIR /app

COPY package*.json ./

RUN npm i -g npm@7.22.0
RUN npm i
RUN npm i -g pm2

COPY . .

RUN npm run build

EXPOSE 4000
EXPOSE 4001

ENTRYPOINT [ "npm", "run", "start:prod" ]