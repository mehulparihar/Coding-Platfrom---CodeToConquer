FROM node:20.19.0

WORKDIR /app

# Copy package files (from root).
COPY package*.json ./

RUN npm install

# Copy only the backend code needed by the judge worker.
COPY . .

# Run the judge service.
CMD ["node", "services/judge.service.js"]
