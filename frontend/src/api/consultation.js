import axiosInstance from '../utils/axiosConfig';

export async function fetchConsultationSession(appointmentId) {
  const response = await axiosInstance.get(`/consultations/${appointmentId}/session`);
  return response.data;
}
