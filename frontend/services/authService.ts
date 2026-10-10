import { fetchApi } from './api';

export const authService = {
  async login(credentials: { email: string; password: string }) {
    return fetchApi<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getMe(token: string) {
    return fetchApi<{ user: any }>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
};
