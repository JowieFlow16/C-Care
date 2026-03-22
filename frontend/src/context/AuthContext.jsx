import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    getMe()
      .then(r => { setUser(r.data.user); setInstitution(r.data.institution); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await apiLogout().catch(() => {});
    setUser(null);
    setInstitution(null);
  };

  return (
    <AuthContext.Provider value={{ user, institution, setUser, setInstitution, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
