FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run the dev server with host mapping
CMD ["npm", "run", "dev", "--", "--host"]
