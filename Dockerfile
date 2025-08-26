FROM node:24-alpine AS builder
WORKDIR /score
COPY . .
RUN npm i
RUN npm run build

FROM node:24-alpine
WORKDIR /score
COPY --from=builder /score/dist ./dist
COPY --from=builder /score/package*.json ./
RUN npm install --production
CMD ["npm", "run", "start"]