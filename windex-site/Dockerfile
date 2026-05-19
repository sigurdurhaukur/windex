FROM node:20-alpine AS base
WORKDIR /app
RUN mkdir -p /data/cache && chmod 755 /data/cache
COPY package*.json ./
RUN npm ci

FROM base AS dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS prod
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
