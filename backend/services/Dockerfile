FROM node:18

WORKDIR /app

# Copy package files (from root).
COPY package*.json ./

RUN npm install

# Copy only the backend code needed by the judge worker.
COPY backend/ ./backend/

# Set working directory to the services folder.
WORKDIR /app/backend/services

# Run the judge service.
CMD ["node", "judge.service.js"]
