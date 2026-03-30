import axiosInstance from '../../../utils/axiosConfig';

// Get current user profile
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await axiosInstance.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.post('/users/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user settings
export const updateUserSettings = async (settings) => {
  try {
    const response = await axiosInstance.put('/users/settings', settings);
    return response.data;
  } catch (error) {
    throw error;
  }
};
