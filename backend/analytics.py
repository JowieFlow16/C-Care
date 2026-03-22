import pandas as pd
from datetime import datetime, timedelta
from models import Sale, Drug, User, db
import io


def get_sales_data(institution_id=None, start_date=None, end_date=None):
    query = db.session.query(
        Sale.sale_id, Sale.date_time, Sale.quantity, Sale.total_price,
        Drug.drug_name, User.name.label('employee_name')
    ).join(Drug, Sale.drug_id == Drug.drug_id
    ).join(User, Sale.employee_id == User.user_id)

    if institution_id:
        query = query.filter(Drug.institution_id == institution_id)
    if start_date:
        query = query.filter(Sale.date_time >= start_date)
    if end_date:
        query = query.filter(Sale.date_time <= end_date)

    results = query.all()
    return pd.DataFrame(results,
                        columns=['sale_id', 'date_time', 'quantity', 'total_price', 'drug_name', 'employee_name'])


def generate_daily_report(institution_id=None):
    today = datetime.now().date()
    df    = get_sales_data(institution_id=institution_id, start_date=today)
    if df.empty:
        return {'total_sales': 0, 'total_revenue': 0, 'transactions': 0, 'top_drug': 'N/A'}
    return {
        'total_sales':   int(df['quantity'].sum()),
        'total_revenue': float(df['total_price'].sum()),
        'transactions':  len(df),
        'top_drug':      df.groupby('drug_name')['quantity'].sum().idxmax()
    }


def generate_monthly_report(institution_id=None):
    start_date = datetime.now().replace(day=1)
    df         = get_sales_data(institution_id=institution_id, start_date=start_date)
    if df.empty:
        return {'total_sales': 0, 'total_revenue': 0, 'transactions': 0, 'avg_transaction': 0}
    return {
        'total_sales':     int(df['quantity'].sum()),
        'total_revenue':   float(df['total_price'].sum()),
        'transactions':    len(df),
        'avg_transaction': float(df['total_price'].mean())
    }


def get_top_selling_drugs(institution_id=None, limit=10):
    df = get_sales_data(institution_id=institution_id)
    if df.empty:
        return []
    top = df.groupby('drug_name').agg(
        {'quantity': 'sum', 'total_price': 'sum'}
    ).sort_values('quantity', ascending=False).head(limit)
    return top.to_dict('index')


def get_employee_performance(institution_id=None):
    df = get_sales_data(institution_id=institution_id)
    if df.empty:
        return []
    perf = df.groupby('employee_name').agg(
        {'sale_id': 'count', 'total_price': 'sum', 'quantity': 'sum'}
    ).rename(columns={'sale_id': 'transactions'})
    return perf.to_dict('index')


def generate_sales_chart_data(days=30, institution_id=None):
    start_date = datetime.now() - timedelta(days=days)
    df         = get_sales_data(institution_id=institution_id, start_date=start_date)
    if df.empty:
        return {'labels': None, 'values': None}
    df['date']   = pd.to_datetime(df['date_time']).dt.date
    daily_sales  = df.groupby('date')['total_price'].sum().reset_index()
    return {
        'labels': [d.strftime('%b %d') for d in daily_sales['date']],
        'values': [round(float(v), 2) for v in daily_sales['total_price']]
    }
