FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Django application
COPY . .

# Use Docker-specific Django settings
ENV DJANGO_SETTINGS_MODULE=pidproject.docker_settings

# Create directories
RUN mkdir -p /data /var/www/static

# Collect static files
RUN DJANGO_SECRET_KEY=build-secret \
    python manage.py collectstatic --noinput

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Persistent Django data
VOLUME /data

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

CMD ["uwsgi", "--ini", "/app/uwsgi.ini"]