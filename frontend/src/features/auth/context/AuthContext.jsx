import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loginRequest,
  registerRequest,
  forgotPasswordRequest,
  resetPasswordRequest
} from '../api/authApi';

const AuthContext = createContext(null);
const SIX_DAYS_MS = 6 * 24 * 60 * 60 * 1000;

function normalizeRole(value) {
  const role = (value || '').toString().trim().toUpperCase();
  if (role === 'DOCTOR' || role === 'ROLE_DOCTOR') return 'DOCTOR';
  return 'PATIENT';
}

function extractToken(data) {
  return data?.token || data?.accessToken || data?.jwt || data?.data?.token || '';
}

function extractUser(data, fallback = {}) {
  const role = normalizeRole(data?.role || data?.user?.role || fallback.role);
  return {
    id: data?.user?.id || data?.id || fallback.id || null,
    name: data?.user?.name || data?.name || fallback.name || '',
    email: data?.user?.email || data?.email || fallback.email || '',
    role,
    licenseNumber: data?.user?.licenseNumber || data?.licenseNumber || fallback.licenseNumber || ''
  };
}

function extractExpiresAtEpochMs(data) {
  const value =
    data?.expiresAtEpochMs ||
    data?.data?.expiresAtEpochMs ||
    data?.expiresAt ||
    data?.data?.expiresAt;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return Date.now() + SIX_DAYS_MS;
}

function isSessionExpired(expiresAtEpochMs) {
  return !expiresAtEpochMs || Date.now() >= expiresAtEpochMs;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = window.localStorage.getItem('authToken') || '';
    const rawUser = window.localStorage.getItem('authUser');
    const rawExpiresAt = window.localStorage.getItem('authSessionExpiresAt');
    const expiresAt = Number(rawExpiresAt || 0);

    if (storedToken && isSessionExpired(expiresAt)) {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('authUser');
      window.localStorage.removeItem('authSessionExpiresAt');
      setIsAuthReady(true);
      return;
    }

    if (storedToken) {
      setToken(storedToken);
    }

    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch {
        window.localStorage.removeItem('authUser');
      }
    }

    setIsAuthReady(true);
  }, []);

  const persistSession = (nextToken, nextUser, expiresAtEpochMs) => {
    setToken(nextToken || '');
    setUser(nextUser || null);

    if (typeof window === 'undefined') return;

    if (nextToken) {
      window.localStorage.setItem('authToken', nextToken);
      window.localStorage.setItem('authSessionExpiresAt', String(expiresAtEpochMs || Date.now() + SIX_DAYS_MS));
    } else {
      window.localStorage.removeItem('authToken');
      window.localStorage.removeItem('authSessionExpiresAt');
    }

    if (nextUser) {
      window.localStorage.setItem('authUser', JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem('authUser');
    }
  };

  const login = async ({ email, password, role }) => {
    setLoading(true);
    try {
      const data = await loginRequest({ email, password, role });
      const nextToken = extractToken(data);
      const nextUser = extractUser(data, { email, role });
      const expiresAtEpochMs = extractExpiresAtEpochMs(data);

      if (!nextToken) {
        throw new Error('Login succeeded but token is missing from API response.');
      }

      persistSession(nextToken, nextUser, expiresAtEpochMs);
      return nextUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, role, licenseNumber }) => {
    setLoading(true);
    try {
      const data = await registerRequest({ name, email, password, role, licenseNumber });
      const nextToken = extractToken(data);
      const nextUser = extractUser(data, { name, email, role, licenseNumber });
      const expiresAtEpochMs = extractExpiresAtEpochMs(data);

      if (nextToken) {
        persistSession(nextToken, nextUser, expiresAtEpochMs);
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async ({ email }) => {
    setLoading(true);
    try {
      return await forgotPasswordRequest({ email });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ token: resetToken, password }) => {
    setLoading(true);
    try {
      return await resetPasswordRequest({ token: resetToken, password });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    persistSession('', null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthReady,
      isAuthenticated: Boolean(token),
      login,
      register,
      forgotPassword,
      resetPassword,
      logout
    }),
    [user, token, loading, isAuthReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
