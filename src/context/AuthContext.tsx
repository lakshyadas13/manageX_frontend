import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginApi, register as registerApi } from '../api/authApi';
import {
  clearAuthStorage,
  readAuthToken,
  readAuthUser,
  saveAuthToken,
  saveAuthUser
} from '../lib/authStorage';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types/auth';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readInitialAuthState = () => {
  const token = readAuthToken();
  const user = readAuthUser();

  if (!token || !user) {
    clearAuthStorage();
    return {
      token: null,
      user: null
    };
  }

  return {
    token,
    user
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialState] = useState(readInitialAuthState);
  const [token, setToken] = useState<string | null>(initialState.token);
  const [user, setUser] = useState<AuthUser | null>(initialState.user);

  const handleAuthSuccess = (nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    saveAuthToken(nextToken);
    saveAuthUser(nextUser);
  };

  const login = async (payload: LoginPayload) => {
    const response = await loginApi(payload);
    handleAuthSuccess(response.token, response.user);
  };

  const register = async (payload: RegisterPayload) => {
    const response = await registerApi(payload);
    handleAuthSuccess(response.token, response.user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    clearAuthStorage();
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
