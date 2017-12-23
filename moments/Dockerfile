FROM node:argon
RUN mkdir /app


ENV NODE_ENV production

WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 3003
CMD ["npm", "start"]
