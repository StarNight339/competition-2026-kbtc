FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# branch นี้ไม่มี package-lock.json จึงใช้ npm install แทน npm ci
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
