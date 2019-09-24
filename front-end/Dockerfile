FROM node:lts-alpine

RUN npm install -g http-server

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .

RUN export BACKEND_HOSTNAME=localhost
RUN export REGISTRATION_SECRET=registrationSecret

RUN npm run build

ENV PORT 8000
EXPOSE 8000

RUN chmod +x  /usr/src/app/entrypoint.sh
CMD ["sh", "/usr/src/app/entrypoint.sh"]