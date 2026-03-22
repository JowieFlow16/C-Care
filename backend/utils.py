from datetime import datetime
import secrets
from models import AuditLog, Notification, db
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io


def generate_transaction_id():
    timestamp   = datetime.now().strftime('%Y%m%d%H%M%S')
    random_part = secrets.token_hex(4).upper()
    return f"CCARE-{timestamp}-{random_part}"


def send_email_notification(subject, body, to_email=None):
    print(f"Email: {subject}")
    return True


def send_sms_notification(message, to_phone=None):
    print(f"SMS: {message}")
    return True


def log_audit(user_id, action, details, ip_address=None):
    try:
        log = AuditLog(user_id=user_id, action=action, details=details, ip_address=ip_address)
        db.session.add(log)
        db.session.commit()
    except Exception:
        pass


def create_notification(title, message, notification_type='info', institution_id=None):
    try:
        notification = Notification(
            title=title,
            message=message,
            notification_type=notification_type,
            institution_id=institution_id
        )
        db.session.add(notification)
        db.session.commit()
    except Exception:
        pass


def notify_admin_sale(sale, drug, employee, institution_id=None):
    create_notification(
        f"Sale: {drug.drug_name}",
        f"{employee.name} sold {sale.quantity} units for ${sale.total_price:.2f}",
        'sale',
        institution_id=institution_id
    )


def check_low_stock(institution_id=None):
    from models import Drug
    query = Drug.query.filter(Drug.stock_quantity < 10)
    if institution_id:
        query = query.filter(Drug.institution_id == institution_id)
    low_stock_drugs = query.all()
    if low_stock_drugs:
        drug_list = ', '.join([f"{d.drug_name} ({d.stock_quantity})" for d in low_stock_drugs])
        create_notification(
            "Low Stock Alert",
            f"Low stock: {drug_list}",
            'alert',
            institution_id=institution_id
        )


def generate_receipt_pdf(sale, drug, customer, employee):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(200, 750, "C-Care_UG - by Convergence")
    c.setFont("Helvetica", 10)
    c.drawString(220, 735, "Secure Care. Trusted Medicine.")
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, 700, "RECEIPT")
    c.setFont("Helvetica", 11)
    y = 670
    c.drawString(50, y, f"Transaction ID: {sale.transaction_id}")
    y -= 20
    c.drawString(50, y, f"Date: {sale.date_time.strftime('%Y-%m-%d %H:%M:%S')}")
    y -= 30
    c.drawString(50, y, f"Drug: {drug.drug_name}")
    y -= 20
    c.drawString(50, y, f"Quantity: {sale.quantity}")
    y -= 20
    c.drawString(50, y, f"Unit Price: ${drug.price:.2f}")
    y -= 20
    c.drawString(50, y, f"Total: ${sale.total_price:.2f}")
    y -= 30
    if customer:
        c.drawString(50, y, f"Customer: {customer.name}")
        y -= 20
    c.drawString(50, y, f"Served by: {employee.name}")
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer
