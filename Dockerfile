FROM node:10.16.3
COPY dist/ dist/
EXPOSE 4000
RUN ls -la
RUN npm install
ENTRYPOINT ["npm","run-script","start"]
