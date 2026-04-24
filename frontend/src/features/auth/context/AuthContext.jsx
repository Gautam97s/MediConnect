import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  loginRequest,
  registerRequest,
  forgotPasswordRequest,
  resetPasswordRequest,
  verify2faRequest,
  refreshTokenRequest
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

function extractRefreshToken(data) {
  return data?.refreshToken || data?.data?.refreshToken || '';
}

function extractUser(data, fallback = {}) {
  const role = normalizeRole(data?.role || data?.user?.role || fallback.role);
  return {
    id: data?.user?.id || data?.id || fallback.id || null,
    name: data?.user?.name || data?.name || fallback.name || '',
    email: data?.user?.email || data?.email || fallback.email || '',
    phone: data?.user?.phone || data?.phone || fallback.phone || '',
    dateOfBirth: data?.user?.dateOfBirth || data?.dateOfBirth || fallback.dateOfBirth || '',
    gender: data?.user?.gender || data?.gender || fallback.gender || '',
    bloodType: data?.user?.bloodType || data?.bloodType || fallback.bloodType || '',
    address: data?.user?.address || data?.address || fallback.address || '',
    medicalNumber: data?.user?.medicalNumber || data?.medicalNumber || fallback.medicalNumber || '',
    diagnosis: data?.user?.diagnosis || data?.diagnosis || fallback.diagnosis || '',
    secondaryDiagnosis: data?.user?.secondaryDiagnosis || data?.secondaryDiagnosis || fallback.secondaryDiagnosis || '',
    urgentAlerts: data?.user?.urgentAlerts || data?.urgentAlerts || fallback.urgentAlerts || '',
    emergencyContactName: data?.user?.emergencyContactName || data?.emergencyContactName || fallback.emergencyContactName || '',
    emergencyContactRelation: data?.user?.emergencyContactRelation || data?.emergencyContactRelation || fallback.emergencyContactRelation || '',
    emergencyContactPhone: data?.user?.emergencyContactPhone || data?.emergencyContactPhone || fallback.emergencyContactPhone || '',
    primaryCareProviderName: data?.user?.primaryCareProviderName || data?.primaryCareProviderName || fallback.primaryCareProviderName || '',
    primaryCareProviderSpecialty: data?.user?.primaryCareProviderSpecialty || data?.primaryCareProviderSpecialty || fallback.primaryCareProviderSpecialty || '',
    insuranceProvider: data?.user?.insuranceProvider || data?.insuranceProvider || fallback.insuranceProvider || '',
    insurancePlan: data?.user?.insurancePlan || data?.insurancePlan || fallback.insurancePlan || '',
    insuranceMemberId: data?.user?.insuranceMemberId || data?.insuranceMemberId || fallback.insuranceMemberId || '',
    insuranceGroupNumber: data?.user?.insuranceGroupNumber || data?.insuranceGroupNumber || fallback.insuranceGroupNumber || '',
    primaryCareVisitCopay: data?.user?.primaryCareVisitCopay || data?.primaryCareVisitCopay || fallback.primaryCareVisitCopay || '',
    specialistVisitCopay: data?.user?.specialistVisitCopay || data?.specialistVisitCopay || fallback.specialistVisitCopay || '',
    emergencyRoomCopay: data?.user?.emergencyRoomCopay || data?.emergencyRoomCopay || fallback.emergencyRoomCopay || '',
    prescriptionDrugsCopay: data?.user?.prescriptionDrugsCopay || data?.prescriptionDrugsCopay || fallback.prescriptionDrugsCopay || '',
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

function extractRefreshExpiresAtEpochMs(data) {
  const value =
    data?.refreshExpiresAtEpochMs ||
    data?.data?.refreshExpiresAtEpochMs ||
    data?.refreshExpiresAt ||
    data?.data?.refreshExpiresAt;

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

function getStoredSessionExpiresAt() {
  if (typeof window === 'undefined') {
    return Date.now() + SIX_DAYS_MS;
  }

  const rawExpiresAt = window.localStorage.getItem('authSessionExpiresAt');
  const expiresAt = Number(rawExpiresAt || 0);
  return Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : Date.now() + SIX_DAYS_MS;
}

function getStoredRefreshExpiresAt() {
  if (typeof window === 'undefined') {
    return Date.now() + SIX_DAYS_MS;
  }

  const rawExpiresAt = window.localStorage.getItem('authRefreshSessionExpiresAt');
  const expiresAt = Number(rawExpiresAt || 0);
  return Number.isFinite(expiresAt) && expiresAt > 0 ? expiresAt : Date.now() + SIX_DAYS_MS;
}

function parseStoredUser(rawUser) {
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
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
    const storedRefreshToken = window.localStorage.getItem('authRefreshToken') || '';
    const rawRefreshExpiresAt = window.localStorage.getItem('authRefreshSessionExpiresAt');
    const expiresAt = Number(rawExpiresAt || 0);
    const refreshExpiresAt = Number(rawRefreshExpiresAt || 0);
    const parsedStoredUser = parseStoredUser(rawUser);

    const restoreFromRefreshToken = async () => {
      if (!storedRefreshToken || !refreshExpiresAt || Date.now() >= refreshExpiresAt) {
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('authUser');
        window.localStorage.removeItem('authSessionExpiresAt');
        window.localStorage.removeItem('authRefreshToken');
        window.localStorage.removeItem('authRefreshSessionExpiresAt');
        setIsAuthReady(true);
        return;
      }

      try {
        const data = await refreshTokenRequest({ refreshToken: storedRefreshToken });
        const nextToken = extractToken(data);
        const nextUser = extractUser(data, parsedStoredUser || {});
        const nextExpiresAt = extractExpiresAtEpochMs(data);
        const nextRefreshToken = extractRefreshToken(data) || storedRefreshToken;
        const nextRefreshExpiresAt = extractRefreshExpiresAtEpochMs(data);

        if (!nextToken) {
          throw new Error('Refresh succeeded but token is missing from API response.');
        }

        persistSession(nextToken, nextUser, nextExpiresAt, nextRefreshToken, nextRefreshExpiresAt);
      } catch {
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('authUser');
        window.localStorage.removeItem('authSessionExpiresAt');
        window.localStorage.removeItem('authRefreshToken');
        window.localStorage.removeItem('authRefreshSessionExpiresAt');
      } finally {
        setIsAuthReady(true);
      }
    };

    if ((storedToken && isSessionExpired(expiresAt)) || (!storedToken && storedRefreshToken)) {
      void restoreFromRefreshToken();
      return;
    }

    if (storedToken) {
      setToken(storedToken);
    }

    if (parsedStoredUser) {
      setUser(parsedStoredUser);
    } else if (rawUser) {
      window.localStorage.removeItem('authUser');
    }

    setIsAuthReady(true);
  }, []);

  const persistSession = (nextToken, nextUser, expiresAtEpochMs, nextRefreshToken = '', nextRefreshExpiresAtEpochMs = null) => {
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

    if (nextRefreshToken) {
      window.localStorage.setItem('authRefreshToken', nextRefreshToken);
      window.localStorage.setItem(
        'authRefreshSessionExpiresAt',
        String(nextRefreshExpiresAtEpochMs || Date.now() + SIX_DAYS_MS)
      );
    } else {
      window.localStorage.removeItem('authRefreshToken');
      window.localStorage.removeItem('authRefreshSessionExpiresAt');
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

      if (data?.requires2fa) {
        return data;
      }

      const nextToken = extractToken(data);
      const nextRefreshToken = extractRefreshToken(data);
      const nextUser = extractUser(data, { email, role });
      const expiresAtEpochMs = extractExpiresAtEpochMs(data);
      const refreshExpiresAtEpochMs = extractRefreshExpiresAtEpochMs(data);

      if (!nextToken) {
        throw new Error('Login succeeded but token is missing from API response.');
      }

      persistSession(nextToken, nextUser, expiresAtEpochMs, nextRefreshToken, refreshExpiresAtEpochMs);
      return nextUser;
    } finally {
      setLoading(false);
    }
  };

  const verify2fa = async ({ userId, twoFactorToken, otp, role }) => {
    setLoading(true);
    try {
      const data = await verify2faRequest({ userId, twoFactorToken, otp, role });
      const nextToken = extractToken(data);
      const nextRefreshToken = extractRefreshToken(data);
      const nextUser = extractUser(data, { id: userId, role });
      const expiresAtEpochMs = extractExpiresAtEpochMs(data);
      const refreshExpiresAtEpochMs = extractRefreshExpiresAtEpochMs(data);

      if (!nextToken) {
        throw new Error('OTP verification succeeded but token is missing from API response.');
      }

      persistSession(nextToken, nextUser, expiresAtEpochMs, nextRefreshToken, refreshExpiresAtEpochMs);
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
      const nextRefreshToken = extractRefreshToken(data);
      const nextUser = extractUser(data, { name, email, role, licenseNumber });
      const expiresAtEpochMs = extractExpiresAtEpochMs(data);
      const refreshExpiresAtEpochMs = extractRefreshExpiresAtEpochMs(data);

      if (nextToken) {
        persistSession(nextToken, nextUser, expiresAtEpochMs, nextRefreshToken, refreshExpiresAtEpochMs);
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    const nextUser = {
      ...(user || {}),
      ...updates
    };

    const expiresAtEpochMs = getStoredSessionExpiresAt();
    persistSession(token, nextUser, expiresAtEpochMs);
    return nextUser;
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
      verify2fa,
      register,
      updateUserProfile,
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
