import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(r => setTenant(r.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setTenant(data.tenant);
    return data;
  };

  const register = async (companyName, email, password) => {
    const { data } = await api.post('/auth/register', { companyName, email, password });
    localStorage.setItem('token', data.token);
    setTenant(data.tenant);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setTenant(null);
  };

  return (
    <AuthContext.Provider value={{ tenant, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
