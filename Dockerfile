FROM node:10.16.3
COPY dist/ dist/
COPY package.json .
EXPOSE 4000
RUN ls -la
RUN npm install
ENTRYPOINT ["node","dist/index.js"]
