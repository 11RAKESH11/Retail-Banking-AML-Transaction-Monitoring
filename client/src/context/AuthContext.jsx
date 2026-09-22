import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginApi, registerApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aml_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('aml_user');
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const response = await loginApi({ email, password });
    if (response.data.success) {
      const { token: jwtToken, user: userData } = response.data;
      localStorage.setItem('aml_token', jwtToken);
      localStorage.setItem('aml_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  };

  const register = async (formData) => {
    const response = await registerApi(formData);
    if (response.data.success) {
      const { token: jwtToken, user: userData } = response.data;
      localStorage.setItem('aml_token', jwtToken);
      localStorage.setItem('aml_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      return userData;
    } else {
      throw new Error(response.data.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('aml_token');
    localStorage.removeItem('aml_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
        isCustomer: user?.role === 'CUSTOMER',
        isEmployee: user?.role === 'EMPLOYEE' || user?.role === 'ADMIN',
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
