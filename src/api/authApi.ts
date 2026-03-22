import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async <T>(endpoint: string, body: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorBody.message || 'Authentication request failed');
  }

  return response.json() as Promise<T>;
};

export const login = (payload: LoginPayload) => request<AuthResponse>('/auth/login', payload);

export const register = (payload: RegisterPayload) =>
  request<AuthResponse>('/auth/register', payload);
