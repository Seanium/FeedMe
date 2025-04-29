FROM node:20-alpine

# Update package list and install necessary packages
# Use dcron for cron, bash for scripts, procps-ng for pkill
RUN apk update && apk add --no-cache dcron bash procps-ng

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@8.4.0

# Copy package.json and pnpm-lock.yaml first for dependency caching
COPY package.json pnpm-lock.yaml ./

# Install project dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the project files
COPY . .

# Ensure the data directory exists
RUN mkdir -p /app/data

# Copy the crontab file to the appropriate directory
COPY config/crontab-docker /etc/crontabs/root
# Apply the crontab
RUN crontab /etc/crontabs/root

# Copy the scripts and make them executable
COPY scripts/update_and_serve.sh /app/scripts/
COPY scripts/entrypoint.sh /app/scripts/
RUN chmod +x /app/scripts/update_and_serve.sh /app/scripts/entrypoint.sh

# Expose the port the application will run on
EXPOSE 3000

# Set the entrypoint to our custom script
ENTRYPOINT ["/app/scripts/entrypoint.sh"]

# Remove the old CMD, as ENTRYPOINT handles the startup
# CMD ["pnpm", "dev"] 