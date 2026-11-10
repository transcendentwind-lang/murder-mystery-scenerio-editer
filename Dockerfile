FROM node:24-alpine

WORKDIR /app

# Alpine compatibility dependencies & git
RUN apk add --no-cache libc6-compat git

# Copy dependency manifests
COPY package.json package-lock.json* ./

# Install project dependencies
RUN npm ci

# Copy application source
COPY . .

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "run", "dev"]
