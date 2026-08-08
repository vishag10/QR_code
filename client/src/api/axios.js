/**
 * axios.js — Centralized Axios Instance
 * ─────────────────────────────────────────────────────────────────────────────
 * All API calls go through this instance. The base URL is read from the
 * VITE_API_URL environment variable, which is set at build time.
 *
 * This means:
 * - In development: Vite proxy forwards /api/* to localhost:5000
 * - In production: Set VITE_API_URL to your deployed backend URL, then rebuild
 *
 * Changing the backend host NEVER breaks printed QR codes because the QR code
 * embeds a frontend URL (/q/exhibition), not a backend endpoint.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach JWT token if available ────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qr_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle global 401 (token expired / invalid) ─────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code;
      if (code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID') {
        // Clear stale token and redirect to login
        localStorage.removeItem('qr_admin_token');
        localStorage.removeItem('qr_admin_username');
        if (window.location.pathname.startsWith('/admin/dashboard')) {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
