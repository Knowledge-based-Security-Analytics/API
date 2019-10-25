FROM openjdk:latest
COPY dist/ dist/
EXPOSE 4000
RUN npm install
ENTRYPOINT ["npm","run-script","start"]
