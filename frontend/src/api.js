import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Auth
export const checkSetup    = ()       => api.get('/api/auth/setup-status');
export const setupApp      = (data)   => api.post('/api/auth/setup', data);
export const login         = (data)   => api.post('/api/auth/login', data);
export const logout        = ()       => api.post('/api/auth/logout');
export const getMe         = ()       => api.get('/api/auth/me');

// Register / Institutions
export const searchInstitutions = (q) => api.get(`/api/institutions/search?q=${encodeURIComponent(q)}`);
export const submitJoinRequest  = (d) => api.post('/api/register', d);
export const createShop         = (d) => api.post('/api/institutions/create', d);

// Dashboard
export const getDashboard = () => api.get('/api/dashboard');

// Drugs
export const getDrugs    = ()       => api.get('/api/drugs');
export const addDrug     = (data)   => api.post('/api/drugs', data);
export const updateDrug  = (id, d)  => api.put(`/api/drugs/${id}`, d);
export const deleteDrug  = (id)     => api.delete(`/api/drugs/${id}`);

// Sales
export const getSales  = ()     => api.get('/api/sales');
export const makeSale  = (data) => api.post('/api/sales', data);
export const getReceiptPdfUrl = (id) => `${API_BASE}/api/sales/${id}/receipt-pdf`;

// Users
export const getUsers    = ()       => api.get('/api/users');
export const addUser     = (data)   => api.post('/api/users', data);
export const toggleUser  = (id)     => api.post(`/api/users/${id}/toggle`);

// Customers
export const getCustomers = () => api.get('/api/customers');

// Join Requests
export const getJoinRequests    = ()   => api.get('/api/join-requests');
export const approveJoinRequest = (id) => api.post(`/api/join-requests/${id}/approve`);
export const rejectJoinRequest  = (id) => api.post(`/api/join-requests/${id}/reject`);

// Notifications
export const getNotifications = () => api.get('/api/notifications');

// Reports
export const getSalesChart         = (days) => api.get(`/api/reports/sales-chart?days=${days}`);
export const getTopDrugs           = ()      => api.get('/api/reports/top-drugs');
export const getEmployeePerformance = ()     => api.get('/api/reports/employee-performance');

// Audit Logs
export const getAuditLogs = () => api.get('/api/audit-logs');

// Settings
export const getSettings    = ()     => api.get('/api/settings');
export const updateSettings = (data) => api.put('/api/settings', data);

export default api;
