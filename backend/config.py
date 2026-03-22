import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-ccare-ug-2024')

    # Supabase uses standard postgresql:// — no channel_binding needed
    _db_url = os.getenv('DATABASE_URL', '')
    # SQLAlchemy 2.x requires postgresql+psycopg2:// scheme
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql+psycopg2://', 1)
    elif _db_url.startswith('postgresql://') and '+' not in _db_url.split('://')[0]:
        _db_url = _db_url.replace('postgresql://', 'postgresql+psycopg2://', 1)

    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
        'pool_size': 5,
        'max_overflow': 10,
        'connect_args': {
            'sslmode': 'require',
        },
    }

    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-ccare-ug-2024')
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    PERMANENT_SESSION_LIFETIME = 1800
