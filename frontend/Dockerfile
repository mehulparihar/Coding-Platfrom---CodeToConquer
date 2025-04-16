# Use Node.js image for building the frontend.
FROM node:18

WORKDIR /app

# Copy package.json and install dependencies.
# (Package.json is at the root; adjust if needed.)
COPY package*.json ./

# Install frontend dependencies.
RUN npm install

# Copy the frontend code.
COPY frontend/ ./frontend/

# Change working directory to frontend.
WORKDIR /app/frontend

# Expose port 5173 (the default port for Vite in development).
EXPOSE 5173

# For development, run the Vite development server.
CMD ["npm", "run", "dev"]
