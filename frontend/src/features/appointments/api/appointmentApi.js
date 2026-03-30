import axiosInstance from '../../../utils/axiosConfig';

// Get all appointments
export const getAllAppointments = async () => {
  try {
    const response = await axiosInstance.get('/appointments');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get appointment by ID
export const getAppointmentById = async (id) => {
  try {
    const response = await axiosInstance.get(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update appointment
export const updateAppointment = async (id, appointmentData) => {
  try {
    const response = await axiosInstance.put(`/appointments/${id}`, appointmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete appointment
export const deleteAppointment = async (id) => {
  try {
    const response = await axiosInstance.delete(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
