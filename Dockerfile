# Base image with Node and Python
FROM node:18-slim

# Install Python and dependencies for PDF processing
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libmagic1 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install backend dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements and install
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the rest of the application
COPY . .

# Build the frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Go back to root
WORKDIR /app

# Ensure uploads and outputs directories exist
RUN mkdir -p uploads outputs

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV PYTHON_PATH=python3

EXPOSE 3000

CMD ["node", "pdf_converter_api.js"]
