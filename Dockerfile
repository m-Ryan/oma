FROM node:10.19.0
WORKDIR /usr/src/oma
COPY package.json .
RUN npm install

EXPOSE 7000
CMD [ "npm", "start" ]

COPY . .

