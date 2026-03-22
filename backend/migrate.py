"""
Migration script to test connection to Supabase.
Run this AFTER you've:
1. Created tables via Supabase SQL Editor (supabase_tables.sql)
2. Updated .env with correct DATABASE_URL from Supabase

Usage:
  python migrate.py
"""
import os
import sys

# Force UTF-8 output
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from dotenv import load_dotenv
load_dotenv()

from app import app, db

with app.app_context():
    print("Testing connection to Supabase...")
    try:
        conn = db.engine.connect()
        print("OK - Connection!")
        conn.close()
    except Exception as e:
        print(f"FAILED - Connection: {e}")
        print("\nTo fix this:")
        print("1. Go to Supabase Dashboard -> Your Project")
        print("2. Settings -> Database")
        print("3. Find 'Connection string' section")
        print("4. Copy the URI (use Transaction mode for pooler)")
        print("5. Paste it into .env as DATABASE_URL")
        exit(1)

    # Check if tables exist
    print("\nChecking tables...")
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    
    expected_tables = [
        'kds_institutions', 'kds_users', 'kds_join_requests',
        'kds_drugs', 'kds_customers', 'kds_sales',
        'kds_reports', 'kds_audit_logs', 'kds_notifications'
    ]
    
    for table in expected_tables:
        if table in tables:
            print(f"  [+] {table}")
        else:
            print(f"  [-] {table} (missing)")
    
    if len(tables) >= len(expected_tables):
        print("\nOK - All tables exist! Database is ready.")
    else:
        print("\nWARNING - Some tables are missing.")
        print("Run supabase_tables.sql in Supabase SQL Editor first.")
