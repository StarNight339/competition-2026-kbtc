FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV PORT=3000
EXPOSE 3000
# ตั้ง NUXT_PUBLIC_API_BASE / NUXT_PUBLIC_FILE_BASE ตอนรันได้ ไม่ต้อง build ใหม่
CMD ["node", ".output/server/index.mjs"]
