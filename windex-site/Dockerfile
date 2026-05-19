FROM node:20-alpine

WORKDIR /app

RUN mkdir -p /data/cache && chmod 755 /data/cache

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
