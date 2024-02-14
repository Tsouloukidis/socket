FROM node:10.15.2

WORKDIR /socket

COPY . /socket

RUN npm install

EXPOSE 3015
CMD node socket.js
