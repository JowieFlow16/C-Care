import sys
from app import app, db
from sqlalchemy import text

with app.app_context():
    with db.engine.connect() as conn:
        tables = conn.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
        )).fetchall()
        print("Tables:", [r[0] for r in tables], flush=True)

        for tbl in ['kds_institutions', 'kds_users', 'kds_join_requests']:
            try:
                rows = conn.execute(text(f"SELECT * FROM {tbl} LIMIT 5")).fetchall()
                print(f"\n{tbl} ({len(rows)} rows):", flush=True)
                for r in rows:
                    print(" ", dict(r._mapping), flush=True)
            except Exception as e:
                print(f"\n{tbl}: ERROR - {e}", flush=True)
