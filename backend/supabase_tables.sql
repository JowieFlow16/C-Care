-- C-Care Uganda Database Schema for Supabase
-- Run this in Supabase SQL Editor to create all tables

-- 1. Institutions table
CREATE TABLE IF NOT EXISTS kds_institutions (
    institution_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    slug VARCHAR(200) NOT NULL UNIQUE,
    address VARCHAR(300),
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS kds_users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    fingerprint_data VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active',
    institution_id INTEGER REFERENCES kds_institutions(institution_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Join Requests table
CREATE TABLE IF NOT EXISTS kds_join_requests (
    request_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    institution_id INTEGER NOT NULL REFERENCES kds_institutions(institution_id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP
);

-- 4. Drugs table
CREATE TABLE IF NOT EXISTS kds_drugs (
    drug_id SERIAL PRIMARY KEY,
    drug_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    price FLOAT NOT NULL,
    stock_quantity INTEGER NOT NULL,
    expiry_date DATE,
    supplier VARCHAR(200),
    description TEXT,
    institution_id INTEGER REFERENCES kds_institutions(institution_id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Customers table
CREATE TABLE IF NOT EXISTS kds_customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    prescription_info TEXT,
    institution_id INTEGER REFERENCES kds_institutions(institution_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Sales table
CREATE TABLE IF NOT EXISTS kds_sales (
    sale_id SERIAL PRIMARY KEY,
    drug_id INTEGER NOT NULL REFERENCES kds_drugs(drug_id),
    employee_id INTEGER NOT NULL REFERENCES kds_users(user_id),
    customer_id INTEGER REFERENCES kds_customers(customer_id),
    quantity INTEGER NOT NULL,
    total_price FLOAT NOT NULL,
    authentication_used VARCHAR(20),
    date_time TIMESTAMP DEFAULT NOW(),
    transaction_id VARCHAR(50) UNIQUE
);

-- 7. Reports table
CREATE TABLE IF NOT EXISTS kds_reports (
    report_id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES kds_users(user_id),
    report_type VARCHAR(50),
    content TEXT,
    date TIMESTAMP DEFAULT NOW()
);

-- 8. Audit Logs table
CREATE TABLE IF NOT EXISTS kds_audit_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES kds_users(user_id),
    action VARCHAR(200) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP DEFAULT NOW()
);

-- 9. Notifications table
CREATE TABLE IF NOT EXISTS kds_notifications (
    notification_id SERIAL PRIMARY KEY,
    institution_id INTEGER REFERENCES kds_institutions(institution_id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_institution ON kds_users(institution_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON kds_users(username);
CREATE INDEX IF NOT EXISTS idx_drugs_institution ON kds_drugs(institution_id);
CREATE INDEX IF NOT EXISTS idx_customers_institution ON kds_customers(institution_id);
CREATE INDEX IF NOT EXISTS idx_sales_drug ON kds_sales(drug_id);
CREATE INDEX IF NOT EXISTS idx_sales_employee ON kds_sales(employee_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON kds_sales(date_time);
CREATE INDEX IF NOT EXISTS idx_notifications_institution ON kds_notifications(institution_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON kds_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON kds_audit_logs(timestamp);

-- Enable Row Level Security (optional, for extra security)
ALTER TABLE kds_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_notifications ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for development (change for production)
CREATE POLICY "Allow all for kds_institutions" ON kds_institutions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for kds_users" ON kds_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for kds_join_requests" ON kds_join_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for kds_drugs" ON kds_drugs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for kds_customers" ON kds_customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for kds_sales" ON kds_sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for kds_reports" ON kds_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for kds_audit_logs" ON kds_audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for kds_notifications" ON kds_notifications FOR ALL USING (true) WITH CHECK (true);

SELECT 'Tables created successfully!' as result;
