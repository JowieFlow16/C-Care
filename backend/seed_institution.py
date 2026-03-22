import sys
from app import app, db
from models import Institution, User
from sqlalchemy import text

with app.app_context():
    # Create institution
    inst = Institution(
        name="C-Care_UG Facility",
        slug="ccare-ug-facility",
        address="",
        phone=""
    )
    db.session.add(inst)
    db.session.commit()  # commit institution first so FK is satisfied
    print(f"Created institution: {inst.name} (id={inst.institution_id})", flush=True)

    # Link all existing users
    with db.engine.connect() as conn:
        result = conn.execute(
            text("UPDATE kds_users SET institution_id = :iid WHERE institution_id IS NULL"),
            {"iid": inst.institution_id}
        )
        conn.commit()
        print(f"Linked {result.rowcount} user(s) to institution.", flush=True)

    for u in User.query.all():
        print(f"  User: {u.name!r}, institution_id={u.institution_id}, status={u.status}", flush=True)

    print("Done.", flush=True)
