FROM node:22-alpine
WORKDIR /server
COPY . .
RUN npm install
EXPOSE 8000
CMD ["node", "server.js"]