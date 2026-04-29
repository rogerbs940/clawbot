FROM node:20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Set environment variable so the app can find the credentials folder
ENV HOME=/root

# Default command to run the Telegram bot
CMD ["npm", "run", "telegram-bot"]
