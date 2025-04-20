# Use Node.js image for building the frontend.
FROM node:20.19.0

WORKDIR /app

# Copy package.json and install dependencies.
# (Package.json is at the root; adjust if needed.)
COPY package*.json ./

# Install frontend dependencies.
RUN npm install

# Copy the frontend code.
COPY . .

# Change working directory to frontend.
Expose 5173

# For development, run the Vite development server.
CMD ["npm", "run", "dev"]
