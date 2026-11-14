"""
Função do Arquivo: Configurações do Django, lidas do ambiente (.env no computador; variáveis do
provedor em produção). Em produção (DEBUG falso): exige SECRET_KEY, força HTTPS, cookies
seguros e serve os arquivos estáticos com o WhiteNoise.

Variáveis: SECRET_KEY, DEBUG, DATABASE_URL, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS,
CSRF_TRUSTED_ORIGINS (listas separadas por vírgula).
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def env_list(name, default=''):
    return [item.strip() for item in os.getenv(name, default).split(',') if item.strip()]


DEBUG = os.getenv('DEBUG', 'False') == 'True'

SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    if not DEBUG:
        raise ImproperlyConfigured('Defina a variável de ambiente SECRET_KEY.')
    SECRET_KEY = 'dev-only-insecure-key'

ALLOWED_HOSTS = env_list('ALLOWED_HOSTS', 'localhost,127.0.0.1')
if os.getenv('RENDER_EXTERNAL_HOSTNAME'):  # a Render informa o endereço do serviço
    ALLOWED_HOSTS.append(os.environ['RENDER_EXTERNAL_HOSTNAME'])

CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
CSRF_TRUSTED_ORIGINS = env_list('CSRF_TRUSTED_ORIGINS')  # necessário para o /admin em HTTPS


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Bibliotecas de Terceiros
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',

    # Apps do RPG.Craft
    'accounts',
    'worlds',
    'characters',
    'peoples',
    'lore',
    'notebook',
    'gallery',
    'maps',
    'activity',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Banco (Supabase). Em hospedagem só IPv4 use a string "Session pooler" (porta 5432).
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=True,
    ),
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Recife'
USE_I18N = True
USE_TZ = True

# Arquivos estáticos (admin e API navegável), servidos pelo WhiteNoise
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',  # Exige login por padrão
    ),
    # Só vale para views que definem throttle_scope (o login)
    'DEFAULT_THROTTLE_CLASSES': ('rest_framework.throttling.ScopedRateThrottle',),
    'DEFAULT_THROTTLE_RATES': {'login': '10/min'},
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Produção: HTTPS atrás do proxy do provedor, cookies seguros e HSTS (comece curto)
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = True
    SECURE_REDIRECT_EXEMPT = [r'^api/health/$']  # a checagem de saúde pode vir por HTTP
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 3600