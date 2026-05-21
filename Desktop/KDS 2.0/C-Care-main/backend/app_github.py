from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from functools import wraps
from datetime import datetime

load_dotenv()

from github_storage import read_json, append_to_array, update_in_array, delete_from_array, ensure_init_files
from models_github import User, Drug

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
CORS(app)

# initialize repo files on startup (best-effort)
try:
    ensure_init_files()
except Exception:
    pass


def get_user_by_username(username):
    users = read_json('users.json').get('data', [])
    return next((u for u in users if u.get('username') == username), None)


def get_user_by_id(user_id):
    users = read_json('users.json').get('data', [])
    return next((u for u in users if int(u.get('user_id', 0)) == int(user_id)), None)


def require_user(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        uid = request.headers.get('X-User-Id') or request.json.get('user_id') if request.json else None
        if not uid:
            return jsonify({'error': 'Missing X-User-Id header'}), 401
        user = get_user_by_id(uid)
        if not user:
            return jsonify({'error': 'Invalid user'}), 401
        request.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        uid = request.headers.get('X-User-Id')
        if not uid:
            return jsonify({'error': 'Missing X-User-Id header'}), 401
        user = get_user_by_id(uid)
        if not user or user.get('role') != 'Admin':
            return jsonify({'error': 'Admin access required'}), 403
        request.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def log_audit(user_id, action, details, ip=None):
    entry = {
        'user_id': user_id,
        'action': action,
        'details': details,
        'ip_address': ip,
        'timestamp': datetime.utcnow().isoformat()
    }
    append_to_array('audit_logs.json', entry, id_key='log_id', commit_message=f'Audit: {action}')


@app.route('/api/auth/setup-status')
def setup_status():
    inst = read_json('institutions.json').get('data', [])
    return jsonify({'needs_setup': len(inst) == 0})


@app.route('/api/auth/setup', methods=['POST'])
def setup():
    data = request.json or {}
    if not data.get('shop_name') or not data.get('username') or not data.get('pin'):
        return jsonify({'error': 'Missing required fields'}), 400
    if data['pin'] != data.get('confirm_pin'):
        return jsonify({'error': 'PINs do not match'}), 400

    inst = {'name': data['shop_name'], 'slug': data['shop_name'].lower().replace(' ', '-'), 'address': data.get('shop_address', ''), 'phone': data.get('shop_phone', '')}
    new_inst = append_to_array('institutions.json', inst, id_key='institution_id', commit_message='Create institution')
    inst_obj = new_inst.get('data', [])[-1]

    user = {'name': data.get('name'), 'username': data.get('username'), 'role': 'Admin', 'pin_hash': '', 'institution_id': inst_obj.get('institution_id')}
    # set pin hash using User helper
    tmp = User(user_id=0, name=user['name'] or '', username=user['username'] or '', role='Admin', pin_hash='')
    tmp.set_pin(data['pin'])
    user['pin_hash'] = tmp.pin_hash
    new_users = append_to_array('users.json', user, id_key='user_id', commit_message='Create admin user')
    log_audit(new_users.get('data', [])[-1].get('user_id'), 'SETUP', f"Setup shop {inst_obj.get('name')}", request.remote_addr)
    return jsonify({'message': 'Setup complete'}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    pin = data.get('pin', '')
    user = get_user_by_username(username)
    if not user:
        log_audit(None, 'FAILED_LOGIN', f'Failed login for {username}', request.remote_addr)
        return jsonify({'error': 'Invalid credentials'}), 401
    try:
        uobj = User(**user)
        if not uobj.check_pin(pin):
            log_audit(None, 'FAILED_LOGIN', f'Failed login for {username}', request.remote_addr)
            return jsonify({'error': 'Invalid credentials'}), 401
    except Exception:
        return jsonify({'error': 'Invalid credentials'}), 401
    inst = None
    if user.get('institution_id'):
        inst = next((i for i in read_json('institutions.json').get('data', []) if int(i.get('institution_id', 0)) == int(user.get('institution_id'))), None)
    log_audit(user.get('user_id'), 'LOGIN', f"User {user.get('username')} logged in", request.remote_addr)
    return jsonify({'user': user, 'institution': inst})


@app.route('/api/drugs', methods=['GET'])
@require_user
def get_drugs():
    data = read_json('drugs.json').get('data', [])
    inst_id = int(request.current_user.get('institution_id')) if request.current_user.get('institution_id') else None
    if inst_id:
        data = [d for d in data if int(d.get('institution_id', 0)) == inst_id]
    return jsonify(data)


@app.route('/api/drugs', methods=['POST'])
@require_admin
def add_drug():
    body = request.json or {}
    item = {
        'drug_name': body.get('drug_name'),
        'category': body.get('category'),
        'price': float(body.get('price') or 0),
        'stock_quantity': int(body.get('stock_quantity') or 0),
        'expiry_date': body.get('expiry_date'),
        'supplier': body.get('supplier'),
        'description': body.get('description'),
        'institution_id': request.current_user.get('institution_id')
    }
    new = append_to_array('drugs.json', item, id_key='drug_id', commit_message='Create drug')
    log_audit(request.current_user.get('user_id'), 'ADD_DRUG', f"Added drug {item.get('drug_name')}", request.remote_addr)
    return jsonify(new.get('data', [])[-1]), 201


@app.route('/api/drugs/<int:drug_id>', methods=['PUT'])
@require_admin
def edit_drug(drug_id):
    try:
        updated = update_in_array('drugs.json', lambda it: int(it.get('drug_id', 0)) == drug_id and int(it.get('institution_id', 0)) == int(request.current_user.get('institution_id', 0)), lambda ex: {**ex, **(request.json or {})}, commit_message=f'Update drug {drug_id}')
        item = next((i for i in updated.get('data', []) if int(i.get('drug_id', 0)) == drug_id), None)
        log_audit(request.current_user.get('user_id'), 'EDIT_DRUG', f"Edited drug {drug_id}", request.remote_addr)
        return jsonify(item)
    except KeyError:
        return jsonify({'error': 'Not found'}), 404


@app.route('/api/drugs/<int:drug_id>', methods=['DELETE'])
@require_admin
def remove_drug(drug_id):
    delete_from_array('drugs.json', lambda it: int(it.get('drug_id', 0)) == drug_id and int(it.get('institution_id', 0)) == int(request.current_user.get('institution_id', 0)), commit_message=f'Delete drug {drug_id}')
    log_audit(request.current_user.get('user_id'), 'DELETE_DRUG', f"Deleted drug {drug_id}", request.remote_addr)
    return jsonify({'message': 'Deleted'})


@app.route('/api/users', methods=['GET'])
@require_admin
def users():
    inst_id = int(request.current_user.get('institution_id', 0))
    users = [u for u in read_json('users.json').get('data', []) if int(u.get('institution_id', 0)) == inst_id]
    return jsonify(users)


@app.route('/api/users', methods=['POST'])
@require_admin
def create_user():
    body = request.json or {}
    if get_user_by_username(body.get('username')):
        return jsonify({'error': 'Username already exists'}), 400
    user = {'name': body.get('name'), 'username': body.get('username'), 'role': body.get('role', 'Employee'), 'pin_hash': '', 'institution_id': request.current_user.get('institution_id')}
    tmp = User(user_id=0, name=user['name'] or '', username=user['username'] or '', role=user['role'], pin_hash='')
    tmp.set_pin(body.get('pin'))
    user['pin_hash'] = tmp.pin_hash
    new = append_to_array('users.json', user, id_key='user_id', commit_message='Create user')
    log_audit(request.current_user.get('user_id'), 'ADD_USER', f"Added user {user.get('username')}", request.remote_addr)
    return jsonify(new.get('data', [])[-1]), 201


@app.route('/api/users/<int:user_id>/toggle', methods=['POST'])
@require_admin
def toggle_user(user_id):
    def updater(u):
        u['is_active'] = not bool(u.get('is_active', True))
        return u
    try:
        updated = update_in_array('users.json', lambda it: int(it.get('user_id', 0)) == user_id and int(it.get('institution_id', 0)) == int(request.current_user.get('institution_id', 0)), lambda ex: updater(ex), commit_message=f'Toggle user {user_id}')
        log_audit(request.current_user.get('user_id'), 'TOGGLE_USER', f"Toggled user {user_id}", request.remote_addr)
        user = next((i for i in updated.get('data', []) if int(i.get('user_id', 0)) == user_id), None)
        return jsonify(user)
    except KeyError:
        return jsonify({'error': 'Not found'}), 404


@app.route('/api/customers')
@require_admin
def customers():
    inst_id = int(request.current_user.get('institution_id', 0))
    customers = [c for c in read_json('customers.json').get('data', []) if int(c.get('institution_id', 0)) == inst_id]
    return jsonify(customers)


@app.route('/api/sales', methods=['GET'])
@require_user
def sales():
    inst_id = int(request.current_user.get('institution_id', 0))
    all_sales = [s for s in read_json('sales.json').get('data', []) if int(s.get('institution_id', 0)) == inst_id]
    if request.current_user.get('role') != 'Admin':
        all_sales = [s for s in all_sales if int(s.get('employee_id', 0)) == int(request.current_user.get('user_id'))]
    return jsonify(all_sales)


@app.route('/api/sales', methods=['POST'])
@require_user
def make_sale():
    data = request.json or {}
    # simple pin check
    pin = data.get('auth_pin', '')
    try:
        u = User(**get_user_by_id(request.current_user.get('user_id')))
        if not u.check_pin(pin):
            return jsonify({'error': 'Invalid PIN'}), 401
    except Exception:
        return jsonify({'error': 'Invalid PIN'}), 401

    drug = next((d for d in read_json('drugs.json').get('data', []) if int(d.get('drug_id', 0)) == int(data.get('drug_id')) and int(d.get('institution_id', 0)) == int(request.current_user.get('institution_id', 0))), None)
    if not drug:
        return jsonify({'error': 'Drug not found'}), 404
    qty = int(data.get('quantity', 0))
    if int(drug.get('stock_quantity', 0)) < qty:
        return jsonify({'error': f"Insufficient stock. Only {drug.get('stock_quantity')} available"}), 400

    customer = None
    if data.get('customer_name'):
        customers = read_json('customers.json').get('data', [])
        customer = next((c for c in customers if c.get('phone') == data.get('customer_phone') and int(c.get('institution_id', 0)) == int(request.current_user.get('institution_id', 0))), None)
        if not customer:
            cust = {'name': data.get('customer_name'), 'phone': data.get('customer_phone'), 'institution_id': request.current_user.get('institution_id')}
            new_c = append_to_array('customers.json', cust, id_key='customer_id', commit_message='Create customer')
            customer = new_c.get('data', [])[-1]

    transaction_id = f"TXN{int(datetime.utcnow().timestamp())}"
    sale = {'drug_id': int(drug.get('drug_id')), 'employee_id': int(request.current_user.get('user_id')), 'customer_id': int(customer.get('customer_id')) if customer else None, 'quantity': qty, 'total_price': float(drug.get('price', 0)) * qty, 'authentication_used': 'PIN', 'transaction_id': transaction_id, 'institution_id': request.current_user.get('institution_id'), 'date_time': datetime.utcnow().isoformat()}
    append_to_array('sales.json', sale, id_key='sale_id', commit_message='Record sale')

    # decrement stock
    try:
        update_in_array('drugs.json', lambda it: int(it.get('drug_id', 0)) == int(drug.get('drug_id')) and int(it.get('institution_id', 0)) == int(request.current_user.get('institution_id', 0)), lambda ex: {**ex, 'stock_quantity': int(ex.get('stock_quantity', 0)) - qty}, commit_message='Adjust stock')
    except Exception:
        pass

    log_audit(request.current_user.get('user_id'), 'SALE', f"Sold {qty} of {drug.get('drug_name')} (TXN:{transaction_id})", request.remote_addr)
    return jsonify({'message': 'Sale recorded', 'transaction_id': transaction_id}), 201


@app.route('/api/notifications')
@require_admin
def notifications():
    inst_id = int(request.current_user.get('institution_id', 0))
    notifs = [n for n in read_json('notifications.json').get('data', []) if int(n.get('institution_id', 0)) == inst_id]
    # mark as read
    def mark_read(n):
        n['is_read'] = True
        return n
    try:
        update_in_array('notifications.json', lambda it: False, lambda ex: ex, commit_message='noop')
    except Exception:
        pass
    return jsonify(notifs)


@app.route('/api/join-requests')
@require_admin
def join_requests():
    inst_id = int(request.current_user.get('institution_id', 0))
    pending = [j for j in read_json('join_requests.json').get('data', []) if int(j.get('institution_id', 0)) == inst_id and j.get('status') == 'pending']
    reviewed = [j for j in read_json('join_requests.json').get('data', []) if int(j.get('institution_id', 0)) == inst_id and j.get('status') != 'pending']
    return jsonify({'pending': pending, 'reviewed': reviewed})


@app.route('/api/join-requests/<int:request_id>/approve', methods=['POST'])
@require_admin
def approve_join_request(request_id):
    jr = next((j for j in read_json('join_requests.json').get('data', []) if int(j.get('request_id', 0)) == request_id), None)
    if not jr:
        return jsonify({'error': 'Not found'}), 404
    if int(jr.get('institution_id', 0)) != int(request.current_user.get('institution_id', 0)):
        return jsonify({'error': 'Unauthorized'}), 403
    if get_user_by_username(jr.get('username')):
        # reject
        update_in_array('join_requests.json', lambda it: int(it.get('request_id', 0)) == request_id, lambda ex: {**ex, 'status': 'rejected', 'reviewed_at': datetime.utcnow().isoformat()}, commit_message='Reject join request collision')
        return jsonify({'error': 'Username already exists, request rejected'}), 400
    # create user
    new_user = {'name': jr.get('name'), 'username': jr.get('username'), 'pin_hash': jr.get('pin_hash'), 'role': 'Employee', 'status': 'active', 'is_active': True, 'institution_id': jr.get('institution_id')}
    append_to_array('users.json', new_user, id_key='user_id', commit_message='Approve join request')
    update_in_array('join_requests.json', lambda it: int(it.get('request_id', 0)) == request_id, lambda ex: {**ex, 'status': 'approved', 'reviewed_at': datetime.utcnow().isoformat()}, commit_message='Mark join request approved')
    log_audit(request.current_user.get('user_id'), 'APPROVE_JOIN', f"Approved {jr.get('name')}", request.remote_addr)
    return jsonify({'message': f"{jr.get('name')} approved"})


@app.route('/api/join-requests/<int:request_id>/reject', methods=['POST'])
@require_admin
def reject_join_request(request_id):
    jr = next((j for j in read_json('join_requests.json').get('data', []) if int(j.get('request_id', 0)) == request_id), None)
    if not jr:
        return jsonify({'error': 'Not found'}), 404
    if int(jr.get('institution_id', 0)) != int(request.current_user.get('institution_id', 0)):
        return jsonify({'error': 'Unauthorized'}), 403
    update_in_array('join_requests.json', lambda it: int(it.get('request_id', 0)) == request_id, lambda ex: {**ex, 'status': 'rejected', 'reviewed_at': datetime.utcnow().isoformat()}, commit_message='Reject join request')
    log_audit(request.current_user.get('user_id'), 'REJECT_JOIN', f"Rejected {jr.get('name')}", request.remote_addr)
    return jsonify({'message': f"{jr.get('name')} rejected"})


@app.route('/api/audit-logs')
@require_admin
def audit_logs():
    inst_id = int(request.current_user.get('institution_id', 0))
    users = [u for u in read_json('users.json').get('data', []) if int(u.get('institution_id', 0)) == inst_id]
    user_ids = [int(u.get('user_id', 0)) for u in users]
    logs = [l for l in read_json('audit_logs.json').get('data', []) if int(l.get('user_id', 0)) in user_ids]
    logs = sorted(logs, key=lambda x: x.get('timestamp', ''), reverse=True)[:200]
    return jsonify(logs)


@app.route('/api/settings', methods=['GET', 'PUT'])
@require_admin
def settings():
    inst_id = int(request.current_user.get('institution_id', 0))
    inst = next((i for i in read_json('institutions.json').get('data', []) if int(i.get('institution_id', 0)) == inst_id), None)
    if not inst:
        return jsonify({'error': 'No institution found'}), 404
    if request.method == 'PUT':
        data = request.json or {}
        def updater(i):
            i['name'] = data.get('name', i.get('name', '')).strip()
            i['address'] = data.get('address', i.get('address', '')).strip()
            i['phone'] = data.get('phone', i.get('phone', '')).strip()
            i['slug'] = i.get('name', '').lower().replace(' ', '-')
            return i
        update_in_array('institutions.json', lambda it: int(it.get('institution_id', 0)) == inst_id, lambda ex: updater(ex), commit_message='Update institution')
        log_audit(request.current_user.get('user_id'), 'EDIT_INSTITUTION', f"Updated: {data.get('name')}", request.remote_addr)
    inst = next((i for i in read_json('institutions.json').get('data', []) if int(i.get('institution_id', 0)) == inst_id), None)
    return jsonify(inst)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
