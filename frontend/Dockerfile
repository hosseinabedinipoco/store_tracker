FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port React will run on
EXPOSE 3000

# Default command to start the React development server
CMD ["npm", "run", "dev"]