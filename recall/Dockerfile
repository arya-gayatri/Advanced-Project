FROM node:argon

ENV NODE_ENV production

RUN mkdir /app
WORKDIR /app
RUN apt-get update && apt-get install -y vim

COPY package.json /app
RUN npm install

COPY . /app

EXPOSE 3003

CMD ["npm", "start"]
