FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

COPY . /app

EXPOSE 3000

CMD ["npm", "run", "dev"]
