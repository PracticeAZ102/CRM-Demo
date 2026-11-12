# =========================================================
# STAGE 1: Build React 18 TypeScript Frontend
# =========================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# =========================================================
# STAGE 2: Python 3.11 FastAPI Backend (Unified Monolith)
# =========================================================
FROM python:3.11-slim AS production
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Application
COPY backend/app ./app

# Copy Compiled Frontend Static Assets from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port (Azure Container Apps defaults to 8000 or custom)
EXPOSE 8000

# Run FastAPI with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

