FROM oven/bun:latest AS base
WORKDIR /usr/src/app

# Install Chrome dependencies
RUN apt-get update && apt-get install -y chromium \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN bun install

# Install Chrome
RUN bunx puppeteer browsers install chrome

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]