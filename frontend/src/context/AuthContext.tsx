import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { authApi } from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedElderlyId: string;
  setSelectedElderlyId: (id: string) => void;
  login: (email: string, password: string) => Promise<User | undefined>;
  register: (data: any) => Promise<User | undefined>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('carenest_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('carenest_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedElderlyId, setSelectedElderlyId] = useState<string>('eld-01');

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res: any = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('carenest_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session verification failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res: any = await authApi.login({ email, password });
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('carenest_token', userToken);
        localStorage.setItem('carenest_user', JSON.stringify(userData));
        if (userData.elderlyProfile?.id) {
          setSelectedElderlyId(userData.elderlyProfile.id);
        }
        return userData;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res: any = await authApi.register(data);
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('carenest_token', userToken);
        localStorage.setItem('carenest_user', JSON.stringify(userData));
        return userData;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('carenest_token');
      localStorage.removeItem('carenest_user');
    }
  };

  const switchDemoRole = async (role: UserRole) => {
    const demoCredentials: Record<UserRole, { email: string; pass: string }> = {
      ELDERLY: { email: 'eleanor.vance@carenest.health', pass: 'Password123!' },
      FAMILY_MEMBER: { email: 'sarah.vance@carenest.health', pass: 'Password123!' },
      CAREGIVER: { email: 'marcus.chen@carenest.health', pass: 'Password123!' },
      DOCTOR: { email: 'dr.adams@carenest.health', pass: 'Password123!' },
      ADMIN: { email: 'marcus.chen@carenest.health', pass: 'Password123!' }
    };

    const target = demoCredentials[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        selectedElderlyId,
        setSelectedElderlyId,
        login,
        register,
        logout,
        switchDemoRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

