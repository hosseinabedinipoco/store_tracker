# 1. Use an official Node.js image
FROM node:18

# 2. Create app directory
WORKDIR /app

# 3. Copy package files first (for better layer caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the app code
COPY . .

# 6. Expose the port the app runs on
EXPOSE 5000

# 7. Run the app
CMD ["npm", "run", "dev"]
