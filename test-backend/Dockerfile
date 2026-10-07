FROM node:22-alpine

WORKDIR /app

COPY package.json server.js ./

USER node

ENV PORT=4001 \
    SERVER_ID=server-1 \
    ENABLE_TEST_FAILURES=false

EXPOSE 4001

CMD ["node", "server.js"]
