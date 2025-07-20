FROM --platform=linux/amd64 node:24-alpine
WORKDIR /server
COPY . .
RUN npm install
EXPOSE 5050
CMD ["node", "server.js"]