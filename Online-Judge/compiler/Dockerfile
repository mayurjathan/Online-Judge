FROM --platform=linux/amd64 node:24-alpine

WORKDIR /app

# Install system dependencies INCLUDING curl
RUN apk update && apk add --no-cache g++ openjdk17 python3 curl 

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

EXPOSE 5100

CMD ["node", "index.js"]