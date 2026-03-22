import type { AuthUser } from '../types/auth';

const TOKEN_STORAGE_KEY = 'managex-auth-token';
const USER_STORAGE_KEY = 'managex-auth-user';

export const readAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const saveAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const readAuthUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const saveAuthUser = (user: AuthUser) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const removeAuthUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

export const clearAuthStorage = () => {
  removeAuthToken();
  removeAuthUser();
};
