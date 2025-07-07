FROM node:24-alpine

WORKDIR /app
COPY package.json .
RUN npm install -g json-server && npm install --production
COPY components.json .
COPY routes.json .
COPY proxy.js .
EXPOSE 3000
EXPOSE 3001

CMD ["sh", "-c", "json-server --watch components.json --host 0.0.0.0 --port 3001 & node proxy.js"]
