FROM node:18-alpine

# First copy package files from root
WORKDIR /app
COPY package*.json ./
# RUN npm ci
RUN npm install --production

# Then copy backend code
COPY backend/ ./backend

# Set final working directory
WORKDIR /app/backend

EXPOSE 5000
CMD ["node", "backend/server.js"]