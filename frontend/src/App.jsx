import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { checkSetup } from './api';

import Landing      from './pages/Landing';
import Login        from './pages/Login';
import CreateShop   from './pages/CreateShop';
import Setup        from './pages/Setup';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import Drugs        from './pages/Drugs';
import DrugForm     from './pages/DrugForm';
import Sale         from './pages/Sale';
import Sales        from './pages/Sales';
import Users        from './pages/Users';
import JoinRequests from './pages/JoinRequests';
import Customers    from './pages/Customers';
import Notifications from './pages/Notifications';
import AuditLogs    from './pages/AuditLogs';
import Reports      from './pages/Reports';
import Settings     from './pages/Settings';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [needsSetup, setNeedsSetup] = useState(null);

  useEffect(() => {
    checkSetup().then(r => setNeedsSetup(r.data.needs_setup)).catch(() => setNeedsSetup(false));
  }, []);

  if (loading || needsSetup === null) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <Routes>
      <Route path="/"            element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/create-shop" element={user ? <Navigate to="/dashboard" replace /> : <CreateShop />} />
      <Route path="/setup"       element={needsSetup ? <Setup /> : <Navigate to="/login" replace />} />
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/drugs"        element={<PrivateRoute><Drugs /></PrivateRoute>} />
      <Route path="/drugs/add"    element={<PrivateRoute adminOnly><DrugForm /></PrivateRoute>} />
      <Route path="/drugs/edit/:id" element={<PrivateRoute adminOnly><DrugForm /></PrivateRoute>} />
      <Route path="/sale"         element={<PrivateRoute><Sale /></PrivateRoute>} />
      <Route path="/sales"        element={<PrivateRoute><Sales /></PrivateRoute>} />
      <Route path="/users"        element={<PrivateRoute adminOnly><Users /></PrivateRoute>} />
      <Route path="/join-requests" element={<PrivateRoute adminOnly><JoinRequests /></PrivateRoute>} />
      <Route path="/customers"    element={<PrivateRoute adminOnly><Customers /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute adminOnly><Notifications /></PrivateRoute>} />
      <Route path="/audit-logs"   element={<PrivateRoute adminOnly><AuditLogs /></PrivateRoute>} />
      <Route path="/reports"      element={<PrivateRoute adminOnly><Reports /></PrivateRoute>} />
      <Route path="/settings"     element={<PrivateRoute adminOnly><Settings /></PrivateRoute>} />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : needsSetup ? '/setup' : '/'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
