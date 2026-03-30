import axiosInstance from '../../../utils/axiosConfig';

// Get all prescriptions
export const getAllPrescriptions = async () => {
  try {
    const response = await axiosInstance.get('/prescriptions');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get prescription by ID
export const getPrescriptionById = async (id) => {
  try {
    const response = await axiosInstance.get(`/prescriptions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create prescription
export const createPrescription = async (prescriptionData) => {
  try {
    const response = await axiosInstance.post('/prescriptions', prescriptionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update prescription
export const updatePrescription = async (id, prescriptionData) => {
  try {
    const response = await axiosInstance.put(`/prescriptions/${id}`, prescriptionData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete prescription
export const deletePrescription = async (id) => {
  try {
    const response = await axiosInstance.delete(`/prescriptions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
