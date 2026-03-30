import { useState, useEffect } from 'react';
import * as userApi from '../api/userApi';

export const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUserProfile();
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const updated = await userApi.updateUserProfile(userData);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Change password
  const changeUserPassword = async (passwordData) => {
    try {
      const result = await userApi.changePassword(passwordData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update settings
  const updateSettings = async (settings) => {
    try {
      const updated = await userApi.updateUserSettings(settings);
      setUser({ ...user, ...updated });
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    user,
    loading,
    error,
    updateProfile,
    changeUserPassword,
    updateSettings,
    refetch: fetchUserProfile,
  };
};
