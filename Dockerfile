FROM node:10.16.3
COPY dist/ dist/
COPY package.json .
EXPOSE 4000
RUN sysctl fs.inotify.max_user_watches=582222 && sudo sysctl -p
RUN ls -la
RUN npm install
ENTRYPOINT ["npm","run-script","start"]
