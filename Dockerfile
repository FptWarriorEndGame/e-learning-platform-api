FROM node:17-alpine

WORKDIR /app

COPY . .

RUN npm install \
    && npm run build

EXPOSE 9000
# required for docker desktop port mapping

CMD ["node", "dist/app.js"]