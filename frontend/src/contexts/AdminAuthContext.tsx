import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface Admin {
  _id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'admin' | 'moderator';
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
}

interface AdminAuthContextType {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Admin>) => Promise<void>;
  hasRole: (requiredRole: 'super-admin' | 'admin' | 'moderator') => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'https://codemeet-yaus.onrender.com/api';

// Role hierarchy: super-admin > admin > moderator
const roleHierarchy: Record<string, number> = {
  'super-admin': 3,
  'admin': 2,
  'moderator': 1,
};

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'));
  const [isLoading, setIsLoading] = useState(true);

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Fetch admin profile on mount if token exists
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/admin/auth/profile`);
        // Backend returns: { admin: {...} }
        setAdmin(response.data.admin);
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
        // Token might be invalid, clear it
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminProfile();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/admin/auth/login`, {
        email,
        password,
      });

      // Backend returns: { message, admin, token, refreshToken }
      const { admin: adminData, token: authToken } = response.data;
      setAdmin(adminData);
      setToken(authToken);
      localStorage.setItem('adminToken', authToken);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (data: Partial<Admin>) => {
    try {
      const response = await axios.put(`${API_URL}/admin/auth/profile`, data);
      // Backend returns: { message, admin: {...} }
      setAdmin(response.data.admin);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Profile update failed';
      throw new Error(errorMessage);
    }
  };

  // Check if admin has required role or higher
  const hasRole = (requiredRole: 'super-admin' | 'admin' | 'moderator'): boolean => {
    if (!admin) return false;
    const adminRoleLevel = roleHierarchy[admin.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    return adminRoleLevel >= requiredRoleLevel;
  };

  const value: AdminAuthContextType = {
    admin,
    token,
    isAuthenticated: !!admin && !!token,
    isLoading,
    login,
    logout,
    updateProfile,
    hasRole,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
