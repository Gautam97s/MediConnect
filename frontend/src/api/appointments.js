import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export async function fetchAppointments(params = {}) {
  const response = await client.get('/appointments', { params });
  return response.data;
}

export async function fetchAppointmentById(id) {
  const response = await client.get(`/appointments/${id}`);
  return response.data;
}

export async function createAppointment(payload) {
  const response = await client.post('/appointments', payload);
  return response.data;
}

export async function cancelAppointment(id) {
  const response = await client.delete(`/appointments/${id}`);
  return response.data;
}

export async function deleteDoctorPatientAppointments(doctorId, patientName) {
  const response = await client.delete(`/appointments/doctor/${doctorId}/patient`, {
    params: { patientName }
  });
  return response.data;
}

export async function updateAppointment(id, payload) {
  const response = await client.put(`/appointments/${id}`, payload);
  return response.data;
}
