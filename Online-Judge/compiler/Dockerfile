FROM node:22-alpine
WORKDIR /app
RUN apk update && apk add --no-cache g++ openjdk17 python3
COPY . .
RUN npm install
EXPOSE 5100
CMD ["node", "index.js"]