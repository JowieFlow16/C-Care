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

# Import the Flask app after loading env
from app import app as flask_app

# Vercel requires the app to be exported as 'app'
app = flask_app
