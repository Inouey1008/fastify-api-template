# --- Build stage ---
FROM node:22 AS build-stage
WORKDIR /app
COPY package*.json ./
COPY api/package*.json ./api/
RUN npm ci
COPY api ./api
WORKDIR /app/api
RUN npm run build

# --- Runtime stage ---
FROM node:22-slim AS runtime-stage
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=3000
WORKDIR /var/task
COPY --from=build-stage /app/api/dist ./dist
CMD ["node", "--enable-source-maps", "dist/index.js"]
