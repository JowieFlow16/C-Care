"""
Vercel API entry point for C-Care Uganda
This wraps the Flask app for serverless deployment
"""
import os
import sys

# Add the parent directory to the path so we can import the app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

# Load environment variables - check for vercel env first, then local .env
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    os.environ['DATABASE_URL'] = DATABASE_URL
else:
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    load_dotenv(env_path)

# Choose which Flask app to expose based on environment.
# Prefer `app_github` if GITHUB_TOKEN or USE_GITHUB_STORAGE is set, otherwise fall back to the default app.
flask_app = None
try:
    if os.environ.get('USE_GITHUB_STORAGE') or os.environ.get('GITHUB_TOKEN'):
        # try github-backed app first
        from app_github import app as flask_app
    else:
        from app import app as flask_app
except Exception:
    # fallback to default app if import fails
    try:
        from app import app as flask_app
    except Exception as e:
        raise

# Vercel requires the app to be exported as 'app'
app = flask_app
