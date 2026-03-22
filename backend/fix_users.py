import sys
from app import app, db
from models import User, Institution
from sqlalchemy import text

with app.app_context():
    inst = Institution.query.first()
    print(f"Institution found: {inst}", flush=True)

    if inst:
        with db.engine.connect() as conn:
            result = conn.execute(
                text("UPDATE kds_users SET institution_id = :iid WHERE institution_id IS NULL"),
                {"iid": inst.institution_id}
            )
            conn.commit()
            print(f"Rows updated: {result.rowcount}", flush=True)

        for u in User.query.all():
            print(f"  User: {u.name!r}, role={u.role}, institution_id={u.institution_id}, status={u.status}", flush=True)
    else:
        print("No institution found — nothing to fix.", flush=True)
