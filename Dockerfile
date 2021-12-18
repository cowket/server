FROM node:14-alpine
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

# RUN npm i -g npm@7.22.0
# RUN npm ci
# RUN npm i -g pm2
RUN yarn
RUN yarn global add pm2

COPY . .

# Test, Build
RUN yarn build

EXPOSE 4000
EXPOSE 4001

ENTRYPOINT [ "npm", "run", "start:prod" ]