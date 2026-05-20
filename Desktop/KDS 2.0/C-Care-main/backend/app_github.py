from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

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


@app.route('/api/drugs', methods=['GET'])
def get_drugs():
    data = read_json('drugs.json')
    return jsonify(data.get('data', []))


@app.route('/api/drugs', methods=['POST'])
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
        'institution_id': body.get('institution_id')
    }
    new = append_to_array('drugs.json', item, id_key='drug_id', commit_message='Create drug')
    return jsonify(new.get('data', [])[-1]), 201


@app.route('/api/drugs/<int:drug_id>', methods=['PUT'])
def edit_drug(drug_id):
    try:
        updated = update_in_array('drugs.json', lambda it: int(it.get('drug_id', 0)) == drug_id, lambda ex: {**ex, **(request.json or {})}, commit_message=f'Update drug {drug_id}')
        item = next((i for i in updated.get('data', []) if int(i.get('drug_id', 0)) == drug_id), None)
        return jsonify(item)
    except KeyError:
        return jsonify({'error': 'Not found'}), 404


@app.route('/api/drugs/<int:drug_id>', methods=['DELETE'])
def remove_drug(drug_id):
    delete_from_array('drugs.json', lambda it: int(it.get('drug_id', 0)) == drug_id, commit_message=f'Delete drug {drug_id}')
    return jsonify({'message': 'Deleted'})


@app.route('/api/users', methods=['GET'])
def get_users():
    data = read_json('users.json')
    return jsonify(data.get('data', []))


@app.route('/api/users', methods=['POST'])
def create_user():
    body = request.json or {}
    user = {
        'name': body.get('name'),
        'username': body.get('username'),
        'role': body.get('role', 'Employee'),
        'pin_hash': body.get('pin_hash', ''),
        'institution_id': body.get('institution_id')
    }
    new = append_to_array('users.json', user, id_key='user_id', commit_message='Create user')
    return jsonify(new.get('data', [])[-1]), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
