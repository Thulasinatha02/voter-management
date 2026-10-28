import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ward_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Active selected Ward for the entire session / dashboard
  const [selectedWard, setSelectedWard] = useState(() => {
    const saved = localStorage.getItem('ward_selected_ward');
    return saved ? JSON.parse(saved) : null;
  });

  const [wards, setWards] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('ward_auth_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('ward_auth_user', JSON.stringify(res.data.data));
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Fetch authorized wards once logged in
  useEffect(() => {
    if (user) {
      fetchWards();
    }
  }, [user]);

  const fetchWards = async () => {
    try {
      const res = await api.get('/wards');
      if (res.data.success && res.data.data.length > 0) {
        setWards(res.data.data);
        // Default select first ward if none selected or if selected is not in allowed list
        setSelectedWard((prev) => {
          if (!prev || !res.data.data.some((w) => w._id === prev._id)) {
            const defaultWard = res.data.data[0];
            localStorage.setItem('ward_selected_ward', JSON.stringify(defaultWard));
            return defaultWard;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching wards:', err);
    }
  };

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      const userData = res.data.data;
      localStorage.setItem('ward_auth_token', userData.token);
      localStorage.setItem('ward_auth_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const logout = () => {
    localStorage.removeItem('ward_auth_token');
    localStorage.removeItem('ward_auth_user');
    localStorage.removeItem('ward_selected_ward');
    setUser(null);
    setSelectedWard(null);
  };

  const changeWard = (ward) => {
    setSelectedWard(ward);
    localStorage.setItem('ward_selected_ward', JSON.stringify(ward));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        wards,
        selectedWard,
        changeWard,
        refreshWards: fetchWards,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
