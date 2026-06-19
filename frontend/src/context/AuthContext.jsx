import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.me();
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { accessToken, refreshToken, user: userData } = response.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    const { accessToken, refreshToken, user: userData } = response.data.data;
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isCreator = () => user?.role === 'CREATOR' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      isAdmin, 
      isCreator,
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
