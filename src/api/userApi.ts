import { readAuthToken } from '../lib/authStorage';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<{ message: string }> => {
  const token = readAuthToken();

  const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  const data = (await response.json().catch(() => ({}))) as { message?: string };

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update password');
  }

  return { message: data.message || 'Password updated successfully' };
};
