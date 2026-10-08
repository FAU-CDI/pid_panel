# ============================================
# Stage 1: Build React frontend
# ============================================

FROM node:22-alpine AS frontend

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./

RUN npm ci 

COPY frontend/ ./

RUN npm run build


# ============================================
# Stage 2: Django + uWSGI
# ============================================

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        sqlite3 \
        media-types \
    && rm -rf /var/lib/apt/lists/*


# Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt


# Django application
COPY . .


# Django settings
ENV DJANGO_SETTINGS_MODULE=pidproject.docker_settings


# Directories
RUN mkdir -p /data /var/www/static /var/www/frontend


# Django static files
RUN DJANGO_SECRET_KEY=build-secret \
    python manage.py collectstatic --noinput


# Copy React production build
COPY --from=frontend /app/dist /var/www/frontend/


# Entrypoint
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh


# Persistent Django data
VOLUME /data


EXPOSE 8000


ENTRYPOINT ["/entrypoint.sh"]

CMD ["uwsgi", "--ini", "/app/uwsgi.ini"]
