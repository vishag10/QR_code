import { createContext, useContext, useState, useCallback } from 'react';

/**
 * AuthContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides JWT-based authentication state and helpers to all components.
 * Token is persisted in localStorage under the key 'qr_admin_token'.
 */

const AuthContext = createContext(null);

const TOKEN_KEY    = 'qr_admin_token';
const USERNAME_KEY = 'qr_admin_username';

export function AuthProvider({ children }) {
  const [token, setToken]       = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_KEY) || null);

  /**
   * login — called after successful /api/auth/login response
   * @param {string} jwtToken   — JWT string from API
   * @param {string} adminName  — Username from API response
   */
  const login = useCallback((jwtToken, adminName) => {
    localStorage.setItem(TOKEN_KEY, jwtToken);
    localStorage.setItem(USERNAME_KEY, adminName);
    setToken(jwtToken);
    setUsername(adminName);
  }, []);

  /**
   * logout — clears token from state and localStorage
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername(null);
  }, []);

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — custom hook to consume AuthContext
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
