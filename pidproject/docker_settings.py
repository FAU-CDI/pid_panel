import os

from .settings import *


DEBUG = False


ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1",
    ).split(",")
    if host.strip()
]


CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "DJANGO_CSRF_TRUSTED_ORIGINS",
        "",
    ).split(",")
    if origin.strip()
]

SECURE_PROXY_SSL_HEADER = (
    "HTTP_X_FORWARDED_PROTO",
    "https",
)

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "",
)


GO_BACKEND_URL = os.environ.get(
    "GO_BACKEND_URL",
    "http://backend:8080",
)

GO_BACKEND_TOKEN = os.environ.get(
    "GO_BACKEND_TOKEN",
    "",
)


KEYCLOAK_CLIENT_ID = os.environ.get(
    "KEYCLOAK_CLIENT_ID",
    "",
)

KEYCLOAK_CLIENT_SECRET = os.environ.get(
    "KEYCLOAK_CLIENT_SECRET",
    "",
)

KEYCLOAK_SERVER_METADATA_URL = os.environ.get(
    "KEYCLOAK_SERVER_METADATA_URL",
    "",
)

KEYCLOAK_ALLOWED_GROUP = os.environ.get(
    "KEYCLOAK_ALLOWED_GROUP",
    "/pid-users",
)


if KEYCLOAK_CLIENT_ID:
    AUTHLIB_OAUTH_CLIENTS = {
        "keycloak": {
            "client_id": KEYCLOAK_CLIENT_ID,
            "client_secret": KEYCLOAK_CLIENT_SECRET,
            "server_metadata_url": KEYCLOAK_SERVER_METADATA_URL,
            "client_kwargs": {
                "scope": "openid profile email",
            },
        }
    }


DATABASES = {
    "default": {
        "ENGINE": os.environ.get(
            "DJANGO_DB_ENGINE",
            "django.db.backends.sqlite3",
        ),
        "NAME": os.environ.get(
            "DJANGO_DB_NAME",
            "/data/db.sqlite3",
        ),
        "USER": os.environ.get(
            "DJANGO_DB_USER",
            "",
        ),
        "PASSWORD": os.environ.get(
            "DJANGO_DB_PASSWORD",
            "",
        ),
        "HOST": os.environ.get(
            "DJANGO_DB_HOST",
            "",
        ),
        "PORT": os.environ.get(
            "DJANGO_DB_PORT",
            "",
        ),
    }
}


STATIC_ROOT = "/var/www/static/"

STATICFILES_STORAGE = (
    "django.contrib.staticfiles.storage.ManifestStaticFilesStorage"
)

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "http://localhost:8000/frontend",
)

# Turn on logging to STDERR - so that uwsgi can print it.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'ERROR',
    },
    'loggers': {
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}
