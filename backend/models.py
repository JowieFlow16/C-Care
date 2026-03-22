from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
import bcrypt

db = SQLAlchemy()


class Institution(db.Model):
    __tablename__ = 'kds_institutions'

    institution_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name           = db.Column(db.String(200), nullable=False, unique=True)
    slug           = db.Column(db.String(200), nullable=False, unique=True)
    address        = db.Column(db.String(300))
    phone          = db.Column(db.String(30))
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    users = db.relationship('User', backref='institution', lazy=True)

    def __repr__(self):
        return f'<Institution {self.name}>'


class User(UserMixin, db.Model):
    __tablename__ = 'kds_users'

    user_id          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name             = db.Column(db.String(100), nullable=False)
    username         = db.Column(db.String(50), unique=True, nullable=False)
    role             = db.Column(db.String(20), nullable=False)  # Admin, Employee
    pin_hash         = db.Column(db.String(255), nullable=False)
    fingerprint_data = db.Column(db.String(500))
    is_active        = db.Column(db.Boolean, default=True)
    # pending = awaiting admin approval, active = approved, rejected = denied
    status           = db.Column(db.String(20), default='active')
    institution_id   = db.Column(db.Integer, db.ForeignKey('kds_institutions.institution_id'), nullable=True)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    sales = db.relationship('Sale', backref='employee', lazy=True)

    def get_id(self):
        return str(self.user_id)

    def set_pin(self, pin):
        self.pin_hash = bcrypt.hashpw(
            pin.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

    def check_pin(self, pin):
        if not pin:
            return False
        try:
            return bcrypt.checkpw(pin.encode('utf-8'), self.pin_hash.encode('utf-8'))
        except Exception:
            return False


class JoinRequest(db.Model):
    __tablename__ = 'kds_join_requests'

    request_id     = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name           = db.Column(db.String(100), nullable=False)
    username       = db.Column(db.String(50), nullable=False)
    pin_hash       = db.Column(db.String(255), nullable=False)
    institution_id = db.Column(db.Integer, db.ForeignKey('kds_institutions.institution_id'), nullable=False)
    status         = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    reviewed_at    = db.Column(db.DateTime)

    institution = db.relationship('Institution', backref='join_requests', lazy=True)

    def set_pin(self, pin):
        self.pin_hash = bcrypt.hashpw(
            pin.encode('utf-8'), bcrypt.gensalt()
        ).decode('utf-8')

    def check_pin(self, pin):
        if not pin:
            return False
        try:
            return bcrypt.checkpw(pin.encode('utf-8'), self.pin_hash.encode('utf-8'))
        except Exception:
            return False


class Drug(db.Model):
    __tablename__ = 'kds_drugs'

    drug_id        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    drug_name      = db.Column(db.String(200), nullable=False)
    category       = db.Column(db.String(100))
    price          = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False)
    expiry_date    = db.Column(db.Date)
    supplier       = db.Column(db.String(200))
    description    = db.Column(db.Text)
    institution_id = db.Column(db.Integer, db.ForeignKey('kds_institutions.institution_id'), nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sales = db.relationship('Sale', backref='drug', lazy=True)


class Customer(db.Model):
    __tablename__ = 'kds_customers'

    customer_id       = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name              = db.Column(db.String(100), nullable=False)
    phone             = db.Column(db.String(20))
    email             = db.Column(db.String(100))
    prescription_info = db.Column(db.Text)
    institution_id    = db.Column(db.Integer, db.ForeignKey('kds_institutions.institution_id'), nullable=True)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    sales = db.relationship('Sale', backref='customer', lazy=True)


class Sale(db.Model):
    __tablename__ = 'kds_sales'

    sale_id             = db.Column(db.Integer, primary_key=True, autoincrement=True)
    drug_id             = db.Column(db.Integer, db.ForeignKey('kds_drugs.drug_id'), nullable=False)
    employee_id         = db.Column(db.Integer, db.ForeignKey('kds_users.user_id'), nullable=False)
    customer_id         = db.Column(db.Integer, db.ForeignKey('kds_customers.customer_id'))
    quantity            = db.Column(db.Integer, nullable=False)
    total_price         = db.Column(db.Float, nullable=False)
    authentication_used = db.Column(db.String(20))
    date_time           = db.Column(db.DateTime, default=datetime.utcnow)
    transaction_id      = db.Column(db.String(50), unique=True)


class Report(db.Model):
    __tablename__ = 'kds_reports'

    report_id   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('kds_users.user_id'))
    report_type = db.Column(db.String(50))
    content     = db.Column(db.Text)
    date        = db.Column(db.DateTime, default=datetime.utcnow)


class AuditLog(db.Model):
    __tablename__ = 'kds_audit_logs'

    log_id     = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id    = db.Column(db.Integer, db.ForeignKey('kds_users.user_id'))
    action     = db.Column(db.String(200), nullable=False)
    details    = db.Column(db.Text)
    ip_address = db.Column(db.String(50))
    timestamp  = db.Column(db.DateTime, default=datetime.utcnow)


class Notification(db.Model):
    __tablename__ = 'kds_notifications'

    notification_id   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    institution_id    = db.Column(db.Integer, db.ForeignKey('kds_institutions.institution_id'), nullable=True)
    title             = db.Column(db.String(200), nullable=False)
    message           = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50))
    is_read           = db.Column(db.Boolean, default=False)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)
