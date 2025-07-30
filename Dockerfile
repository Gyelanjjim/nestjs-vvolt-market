FROM node:22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
COPY .env.production .env

RUN npm run build
RUN npm install -g pm2

CMD ["pm2-runtime", "run-vvolt.json"]
