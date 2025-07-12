FROM --platform=linux/amd64 node:24-alpine
WORKDIR /app
RUN apk update && apk add --no-cache g++ openjdk17 python3
COPY . .
RUN npm install
EXPOSE 5100
CMD ["node", "index.js"]