import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const ALL_WARDS_OPTION = {
  _id: 'ALL',
  wardCode: 'ALL',
  wardName: 'All Wards (Consolidated)',
  locality: 'Entire Constituency',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ward_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Active selected Ward for the entire session / dashboard
  const [selectedWard, setSelectedWard] = useState(() => {
    const saved = localStorage.getItem('ward_selected_ward');
    if (!saved) return ALL_WARDS_OPTION;
    try {
      const parsed = JSON.parse(saved);
      if (parsed?._id === 'ALL') return ALL_WARDS_OPTION;
      return parsed;
    } catch {
      return ALL_WARDS_OPTION;
    }
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
    if (user?._id) {
      fetchWards();
    }
  }, [user?._id]);

  const fetchWards = async (newWardIdToSelect = null) => {
    try {
      const res = await api.get('/wards');
      if (res.data.success && res.data.data.length > 0) {
        setWards(res.data.data);

        // If a specific newly created ward was requested, select it
        if (newWardIdToSelect) {
          const targetNewWard = res.data.data.find((w) => w._id === newWardIdToSelect);
          if (targetNewWard) {
            setSelectedWard(targetNewWard);
            localStorage.setItem('ward_selected_ward', JSON.stringify(targetNewWard));
            return;
          }
        }

        // Preserve ALL if already chosen
        setSelectedWard((prev) => {
          if (prev?._id === 'ALL') {
            return ALL_WARDS_OPTION;
          }
          if (!prev || !res.data.data.some((w) => w._id === prev._id)) {
            // Default to ALL_WARDS_OPTION for holistic analytics
            localStorage.setItem('ward_selected_ward', JSON.stringify(ALL_WARDS_OPTION));
            return ALL_WARDS_OPTION;
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

  const refreshUser = async () => {
    try {
      const userRes = await api.get('/auth/me');
      if (userRes.data.success) {
        setUser(userRes.data.data);
        localStorage.setItem('ward_auth_user', JSON.stringify(userRes.data.data));
      }
    } catch (e) {
      console.error(e);
    }
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
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
