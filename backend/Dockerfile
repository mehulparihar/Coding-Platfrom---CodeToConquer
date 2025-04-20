FROM node:20.19.0

# First copy package files from root
WORKDIR /app

COPY package*.json ./
# RUN npm ci
RUN npm install

# Then copy backend code
COPY . .

Expose 5000

# Set final working directory
CMD [ "npm", "run", "dev" ]