import type { Task, TaskFilters, TaskPayload } from '../types/task';
import { readAuthToken } from '../lib/authStorage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = readAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...options
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorBody.message || 'Request failed');
  }

  return response.json() as Promise<T>;
};

export const getTasks = (filters: TaskFilters): Promise<Task[]> => {
  const searchParams = new URLSearchParams();

  if (filters.priority !== 'all') {
    searchParams.set('priority', filters.priority);
  }

  if (filters.completed !== 'all') {
    searchParams.set('completed', String(filters.completed === 'completed'));
  }

  if (filters.tags.trim()) {
    searchParams.set('tags', filters.tags);
  }

  searchParams.set('sort', filters.sort);

  const query = searchParams.toString();
  return request<Task[]>(`/tasks${query ? `?${query}` : ''}`);
};

export const createTask = (payload: TaskPayload): Promise<Task> =>
  request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

export const updateTask = (id: string, payload: Partial<TaskPayload>): Promise<Task> =>
  request<Task>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });

export const deleteTask = (id: string): Promise<{ message: string }> =>
  request<{ message: string }>(`/tasks/${id}`, {
    method: 'DELETE'
  });
