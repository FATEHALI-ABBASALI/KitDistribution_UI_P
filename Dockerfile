FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build && npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
