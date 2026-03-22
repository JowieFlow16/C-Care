from flask import Flask, request, jsonify, send_file, Response
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from functools import wraps
from datetime import datetime
from dotenv import load_dotenv
import pandas as pd
import io
import csv
import os
import re

load_dotenv()
from config import Config
from models import db, User, Drug, Customer, Sale, Notification, AuditLog, Institution, JoinRequest
from utils import *
from analytics import *

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://localhost:3000', 'app://.*', 'capacitor://localhost', 'http://localhost'])

login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Unauthorized'}), 401


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'Admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text


def user_dict(u):
    return {
        'user_id': u.user_id, 'name': u.name, 'username': u.username,
        'role': u.role, 'is_active': u.is_active, 'status': u.status,
        'institution_id': u.institution_id,
        'created_at': u.created_at.isoformat()
    }


def drug_dict(d):
    return {
        'drug_id': d.drug_id, 'drug_name': d.drug_name, 'category': d.category,
        'price': d.price, 'stock_quantity': d.stock_quantity,
        'expiry_date': d.expiry_date.isoformat() if d.expiry_date else None,
        'supplier': d.supplier, 'description': d.description,
        'institution_id': d.institution_id,
        'created_at': d.created_at.isoformat()
    }


def sale_dict(s):
    drug = Drug.query.get(s.drug_id)
    emp  = User.query.get(s.employee_id)
    cust = Customer.query.get(s.customer_id) if s.customer_id else None
    return {
        'sale_id': s.sale_id, 'transaction_id': s.transaction_id,
        'drug_id': s.drug_id, 'drug_name': drug.drug_name if drug else '',
        'employee_id': s.employee_id, 'employee_name': emp.name if emp else '',
        'customer_id': s.customer_id, 'customer_name': cust.name if cust else '',
        'quantity': s.quantity, 'total_price': s.total_price,
        'authentication_used': s.authentication_used,
        'date_time': s.date_time.isoformat()
    }


def customer_dict(c):
    total_spent = sum(s.total_price for s in c.sales)
    return {
        'customer_id': c.customer_id, 'name': c.name, 'phone': c.phone,
        'email': c.email, 'total_purchases': len(c.sales),
        'total_spent': round(total_spent, 2),
        'created_at': c.created_at.isoformat()
    }


def notif_dict(n):
    return {
        'notification_id': n.notification_id, 'title': n.title,
        'message': n.message, 'notification_type': n.notification_type,
        'is_read': n.is_read, 'created_at': n.created_at.isoformat()
    }


def jr_dict(jr):
    return {
        'request_id': jr.request_id, 'name': jr.name, 'username': jr.username,
        'institution_id': jr.institution_id,
        'institution_name': jr.institution.name if jr.institution else '',
        'status': jr.status, 'created_at': jr.created_at.isoformat(),
        'reviewed_at': jr.reviewed_at.isoformat() if jr.reviewed_at else None
    }


# ── AUTH ──────────────────────────────────────────────────────────────────────

@app.route('/api/auth/setup-status')
def setup_status():
    return jsonify({'needs_setup': Institution.query.count() == 0})


@app.route('/api/auth/setup', methods=['POST'])
def setup():
    if Institution.query.count() > 0 and User.query.count() > 0:
        return jsonify({'error': 'Already set up'}), 400
    data = request.json
    if not data.get('shop_name') or not data.get('username') or not data.get('pin'):
        return jsonify({'error': 'Missing required fields'}), 400
    if data['pin'] != data.get('confirm_pin'):
        return jsonify({'error': 'PINs do not match'}), 400

    inst = Institution(name=data['shop_name'], slug=slugify(data['shop_name']),
                       address=data.get('shop_address', ''), phone=data.get('shop_phone', ''))
    db.session.add(inst)
    db.session.flush()

    admin = User(name=data['name'], username=data['username'], role='Admin',
                 status='active', institution_id=inst.institution_id)
    admin.set_pin(data['pin'])
    db.session.add(admin)
    db.session.commit()
    return jsonify({'message': 'Setup complete'}), 201


@app.route('/api/institutions/create', methods=['POST'])
def create_institution():
    data = request.json
    if not data.get('shop_name') or not data.get('username') or not data.get('pin') or not data.get('name'):
        return jsonify({'error': 'Missing required fields'}), 400
    if data['pin'] != data.get('confirm_pin'):
        return jsonify({'error': 'PINs do not match'}), 400
    if len(str(data['pin'])) < 4:
        return jsonify({'error': 'PIN must be at least 4 digits'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 400
    if Institution.query.filter(Institution.name.ilike(data['shop_name'].strip())).first():
        return jsonify({'error': 'A shop with that name already exists'}), 400

    inst = Institution(name=data['shop_name'].strip(), slug=slugify(data['shop_name']),
                       address=data.get('shop_address', ''), phone=data.get('shop_phone', ''))
    db.session.add(inst)
    db.session.flush()

    admin = User(name=data['name'], username=data['username'], role='Admin',
                 status='active', is_active=True, institution_id=inst.institution_id)
    admin.set_pin(data['pin'])
    db.session.add(admin)
    db.session.commit()
    return jsonify({'message': 'Shop created successfully'}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if not user or not user.check_pin(data.get('pin', '')):
        log_audit(None, 'FAILED_LOGIN', f"Failed login for {data.get('username')}", request.remote_addr)
        return jsonify({'error': 'Invalid credentials'}), 401
    if user.status == 'pending':
        return jsonify({'error': 'Account pending admin approval'}), 403
    if user.status == 'rejected':
        return jsonify({'error': 'Account request was rejected'}), 403
    if not user.is_active:
        return jsonify({'error': 'Account deactivated'}), 403
    login_user(user, remember=True)
    log_audit(user.user_id, 'LOGIN', f'User {user.name} logged in', request.remote_addr)
    return jsonify({'user': user_dict(user), 'institution': {
        'institution_id': user.institution.institution_id,
        'name': user.institution.name,
        'address': user.institution.address,
        'phone': user.institution.phone
    } if user.institution else None})


@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    log_audit(current_user.user_id, 'LOGOUT', f'User {current_user.name} logged out', request.remote_addr)
    logout_user()
    return jsonify({'message': 'Logged out'})


@app.route('/api/auth/me')
@login_required
def me():
    return jsonify({'user': user_dict(current_user), 'institution': {
        'institution_id': current_user.institution.institution_id,
        'name': current_user.institution.name,
        'address': current_user.institution.address,
        'phone': current_user.institution.phone
    } if current_user.institution else None})


# ── REGISTER (employee join request) ─────────────────────────────────────────

@app.route('/api/institutions/search')
def search_institutions():
    q = request.args.get('q', '').strip()
    results = Institution.query.filter(Institution.name.ilike(f'%{q}%')).all() if q else []
    return jsonify([{'id': i.institution_id, 'name': i.name, 'address': i.address or ''} for i in results])


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('institution_id') or not data.get('username') or not data.get('pin'):
        return jsonify({'error': 'Missing required fields'}), 400
    if data['pin'] != data.get('confirm_pin'):
        return jsonify({'error': 'PINs do not match'}), 400
    if User.query.filter_by(username=data['username']).first() or \
       JoinRequest.query.filter_by(username=data['username'], status='pending').first():
        return jsonify({'error': 'Username already taken'}), 400

    jr = JoinRequest(name=data['name'], username=data['username'],
                     institution_id=data['institution_id'])
    jr.set_pin(data['pin'])
    db.session.add(jr)
    db.session.commit()

    inst = Institution.query.get(data['institution_id'])
    create_notification(f"New Join Request: {data['name']}",
                        f"{data['name']} (@{data['username']}) wants to join {inst.name}.",
                        'join_request', institution_id=inst.institution_id)
    return jsonify({'message': 'Join request submitted'}), 201


# ── JOIN REQUESTS ─────────────────────────────────────────────────────────────

@app.route('/api/join-requests')
@login_required
@admin_required
def join_requests():
    inst_id  = current_user.institution_id
    pending  = JoinRequest.query.filter_by(institution_id=inst_id, status='pending').order_by(JoinRequest.created_at.desc()).all()
    reviewed = JoinRequest.query.filter(JoinRequest.institution_id == inst_id, JoinRequest.status != 'pending').order_by(JoinRequest.reviewed_at.desc()).limit(30).all()
    return jsonify({'pending': [jr_dict(j) for j in pending], 'reviewed': [jr_dict(j) for j in reviewed]})


@app.route('/api/join-requests/<int:request_id>/approve', methods=['POST'])
@login_required
@admin_required
def approve_join_request(request_id):
    jr = JoinRequest.query.get_or_404(request_id)
    if jr.institution_id != current_user.institution_id:
        return jsonify({'error': 'Unauthorized'}), 403
    if User.query.filter_by(username=jr.username).first():
        jr.status = 'rejected'
        jr.reviewed_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'error': 'Username already exists, request rejected'}), 400

    new_user = User(name=jr.name, username=jr.username, pin_hash=jr.pin_hash,
                    role='Employee', status='active', is_active=True,
                    institution_id=jr.institution_id)
    db.session.add(new_user)
    jr.status = 'approved'
    jr.reviewed_at = datetime.utcnow()
    db.session.commit()
    log_audit(current_user.user_id, 'APPROVE_JOIN', f'Approved {jr.name}', request.remote_addr)
    return jsonify({'message': f'{jr.name} approved'})


@app.route('/api/join-requests/<int:request_id>/reject', methods=['POST'])
@login_required
@admin_required
def reject_join_request(request_id):
    jr = JoinRequest.query.get_or_404(request_id)
    if jr.institution_id != current_user.institution_id:
        return jsonify({'error': 'Unauthorized'}), 403
    jr.status = 'rejected'
    jr.reviewed_at = datetime.utcnow()
    db.session.commit()
    log_audit(current_user.user_id, 'REJECT_JOIN', f'Rejected {jr.name}', request.remote_addr)
    return jsonify({'message': f'{jr.name} rejected'})


# ── DASHBOARD ─────────────────────────────────────────────────────────────────

@app.route('/api/dashboard')
@login_required
def dashboard():
    inst_id = current_user.institution_id
    if current_user.role == 'Admin':
        low_stock = Drug.query.filter(Drug.institution_id == inst_id, Drug.stock_quantity < 10).all()
        notifs    = Notification.query.filter_by(institution_id=inst_id).order_by(Notification.created_at.desc()).limit(10).all()
        pending   = JoinRequest.query.filter_by(institution_id=inst_id, status='pending').count()
        unread    = Notification.query.filter_by(institution_id=inst_id, is_read=False).count()
        return jsonify({
            'daily':    generate_daily_report(inst_id),
            'monthly':  generate_monthly_report(inst_id),
            'low_stock': [drug_dict(d) for d in low_stock],
            'notifications': [notif_dict(n) for n in notifs],
            'pending_requests': pending,
            'unread_notifs': unread
        })
    else:
        drugs = Drug.query.filter(Drug.institution_id == inst_id, Drug.stock_quantity > 0).all()
        return jsonify({'drugs': [drug_dict(d) for d in drugs]})


# ── DRUGS ─────────────────────────────────────────────────────────────────────

@app.route('/api/drugs')
@login_required
def drugs():
    inst_id = current_user.institution_id
    all_drugs = Drug.query.filter_by(institution_id=inst_id).all()
    return jsonify([drug_dict(d) for d in all_drugs])


@app.route('/api/drugs', methods=['POST'])
@login_required
@admin_required
def add_drug():
    data = request.json
    drug = Drug(
        drug_name=data['drug_name'], category=data.get('category'),
        price=float(data['price']), stock_quantity=int(data['stock_quantity']),
        expiry_date=datetime.strptime(data['expiry_date'], '%Y-%m-%d').date() if data.get('expiry_date') else None,
        supplier=data.get('supplier'), description=data.get('description'),
        institution_id=current_user.institution_id
    )
    db.session.add(drug)
    db.session.commit()
    log_audit(current_user.user_id, 'ADD_DRUG', f'Added drug: {drug.drug_name}', request.remote_addr)
    return jsonify(drug_dict(drug)), 201


@app.route('/api/drugs/<int:drug_id>', methods=['PUT'])
@login_required
@admin_required
def edit_drug(drug_id):
    drug = Drug.query.filter_by(drug_id=drug_id, institution_id=current_user.institution_id).first_or_404()
    data = request.json
    drug.drug_name     = data.get('drug_name', drug.drug_name)
    drug.category      = data.get('category', drug.category)
    drug.price         = float(data.get('price', drug.price))
    drug.stock_quantity = int(data.get('stock_quantity', drug.stock_quantity))
    drug.expiry_date   = datetime.strptime(data['expiry_date'], '%Y-%m-%d').date() if data.get('expiry_date') else drug.expiry_date
    drug.supplier      = data.get('supplier', drug.supplier)
    drug.description   = data.get('description', drug.description)
    db.session.commit()
    log_audit(current_user.user_id, 'EDIT_DRUG', f'Edited drug: {drug.drug_name}', request.remote_addr)
    return jsonify(drug_dict(drug))


@app.route('/api/drugs/<int:drug_id>', methods=['DELETE'])
@login_required
@admin_required
def delete_drug(drug_id):
    drug = Drug.query.filter_by(drug_id=drug_id, institution_id=current_user.institution_id).first_or_404()
    name = drug.drug_name
    db.session.delete(drug)
    db.session.commit()
    log_audit(current_user.user_id, 'DELETE_DRUG', f'Deleted drug: {name}', request.remote_addr)
    return jsonify({'message': f'{name} deleted'})


# ── SALES ─────────────────────────────────────────────────────────────────────

@app.route('/api/sales')
@login_required
def sales():
    inst_id = current_user.institution_id
    if current_user.role == 'Admin':
        all_sales = Sale.query.join(Drug).filter(Drug.institution_id == inst_id).order_by(Sale.date_time.desc()).all()
    else:
        all_sales = Sale.query.filter_by(employee_id=current_user.user_id).order_by(Sale.date_time.desc()).all()
    return jsonify([sale_dict(s) for s in all_sales])


@app.route('/api/sales', methods=['POST'])
@login_required
def make_sale():
    data    = request.json
    inst_id = current_user.institution_id

    if not current_user.check_pin(data.get('auth_pin', '')):
        return jsonify({'error': 'Invalid PIN'}), 401

    drug = Drug.query.filter_by(drug_id=data['drug_id'], institution_id=inst_id).first_or_404()
    qty  = int(data['quantity'])

    if drug.stock_quantity < qty:
        return jsonify({'error': f'Insufficient stock. Only {drug.stock_quantity} available'}), 400

    customer = None
    if data.get('customer_name'):
        customer = Customer.query.filter_by(phone=data.get('customer_phone'), institution_id=inst_id).first() if data.get('customer_phone') else None
        if not customer:
            customer = Customer(name=data['customer_name'], phone=data.get('customer_phone'), institution_id=inst_id)
            db.session.add(customer)
            db.session.commit()

    transaction_id = generate_transaction_id()
    new_sale = Sale(
        drug_id=drug.drug_id, employee_id=current_user.user_id,
        customer_id=customer.customer_id if customer else None,
        quantity=qty, total_price=drug.price * qty,
        authentication_used='PIN', transaction_id=transaction_id
    )
    drug.stock_quantity -= qty
    db.session.add(new_sale)
    db.session.commit()

    log_audit(current_user.user_id, 'SALE', f'Sold {qty} of {drug.drug_name} (TXN:{transaction_id})', request.remote_addr)
    notify_admin_sale(new_sale, drug, current_user, inst_id)
    check_low_stock(inst_id)
    return jsonify(sale_dict(new_sale)), 201


@app.route('/api/sales/<int:sale_id>/receipt-pdf')
@login_required
def receipt_pdf(sale_id):
    s    = Sale.query.get_or_404(sale_id)
    drug = Drug.query.get(s.drug_id)
    cust = Customer.query.get(s.customer_id) if s.customer_id else None
    emp  = User.query.get(s.employee_id)
    buf  = generate_receipt_pdf(s, drug, cust, emp)
    return send_file(buf, as_attachment=True, download_name=f'receipt_{s.transaction_id}.pdf', mimetype='application/pdf')


# ── USERS ─────────────────────────────────────────────────────────────────────

@app.route('/api/users')
@login_required
@admin_required
def users():
    all_users = User.query.filter_by(institution_id=current_user.institution_id).all()
    return jsonify([user_dict(u) for u in all_users])


@app.route('/api/users', methods=['POST'])
@login_required
@admin_required
def add_user():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    user = User(name=data['name'], username=data['username'], role=data['role'],
                status='active', institution_id=current_user.institution_id)
    user.set_pin(data['pin'])
    db.session.add(user)
    db.session.commit()
    log_audit(current_user.user_id, 'ADD_USER', f'Added user: {user.name}', request.remote_addr)
    return jsonify(user_dict(user)), 201


@app.route('/api/users/<int:user_id>/toggle', methods=['POST'])
@login_required
@admin_required
def toggle_user(user_id):
    user = User.query.filter_by(user_id=user_id, institution_id=current_user.institution_id).first_or_404()
    if user.user_id == current_user.user_id:
        return jsonify({'error': 'Cannot deactivate your own account'}), 400
    user.is_active = not user.is_active
    db.session.commit()
    log_audit(current_user.user_id, 'TOGGLE_USER', f'User {user.name} toggled', request.remote_addr)
    return jsonify(user_dict(user))


# ── CUSTOMERS ─────────────────────────────────────────────────────────────────

@app.route('/api/customers')
@login_required
@admin_required
def customers():
    all_customers = Customer.query.filter_by(institution_id=current_user.institution_id).order_by(Customer.created_at.desc()).all()
    return jsonify([customer_dict(c) for c in all_customers])


# ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

@app.route('/api/notifications')
@login_required
@admin_required
def notifications():
    inst_id = current_user.institution_id
    all_notifs = Notification.query.filter_by(institution_id=inst_id).order_by(Notification.created_at.desc()).all()
    Notification.query.filter_by(institution_id=inst_id, is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify([notif_dict(n) for n in all_notifs])


# ── REPORTS ───────────────────────────────────────────────────────────────────

@app.route('/api/reports/sales-chart')
@login_required
@admin_required
def sales_chart():
    days = request.args.get('days', 30, type=int)
    return jsonify(generate_sales_chart_data(days, current_user.institution_id))


@app.route('/api/reports/top-drugs')
@login_required
@admin_required
def top_drugs():
    return jsonify(get_top_selling_drugs(current_user.institution_id))


@app.route('/api/reports/employee-performance')
@login_required
@admin_required
def employee_performance():
    return jsonify(get_employee_performance(current_user.institution_id))


# ── AUDIT LOGS ────────────────────────────────────────────────────────────────

@app.route('/api/audit-logs')
@login_required
@admin_required
def audit_logs():
    inst_users = [u.user_id for u in User.query.filter_by(institution_id=current_user.institution_id).all()]
    logs = AuditLog.query.filter(AuditLog.user_id.in_(inst_users)).order_by(AuditLog.timestamp.desc()).limit(200).all()
    return jsonify([{
        'log_id': l.log_id, 'user_id': l.user_id, 'action': l.action,
        'details': l.details, 'ip_address': l.ip_address,
        'timestamp': l.timestamp.isoformat()
    } for l in logs])


# ── SETTINGS ──────────────────────────────────────────────────────────────────

@app.route('/api/settings', methods=['GET', 'PUT'])
@login_required
@admin_required
def settings():
    inst = Institution.query.get(current_user.institution_id)
    if not inst:
        return jsonify({'error': 'No institution found'}), 404
    if request.method == 'PUT':
        data = request.json
        inst.name    = data.get('name', inst.name).strip()
        inst.address = data.get('address', inst.address or '').strip()
        inst.phone   = data.get('phone', inst.phone or '').strip()
        inst.slug    = slugify(inst.name)
        db.session.commit()
        log_audit(current_user.user_id, 'EDIT_INSTITUTION', f'Updated: {inst.name}', request.remote_addr)
    return jsonify({
        'institution_id': inst.institution_id, 'name': inst.name,
        'slug': inst.slug, 'address': inst.address, 'phone': inst.phone,
        'created_at': inst.created_at.isoformat(),
        'total_staff': len(inst.users)
    })


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print('API server running on http://localhost:5000')
    app.run(debug=True, host='0.0.0.0', port=5000)
