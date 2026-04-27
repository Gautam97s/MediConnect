import axiosInstance from '../utils/axiosConfig';

export async function placePrescriptionOrder(payload) {
  const response = await axiosInstance.post('/orders/prescription', payload);
  return response.data;
}

export async function fetchMyOrders() {
  const response = await axiosInstance.get('/orders/my');
  return response.data;
}