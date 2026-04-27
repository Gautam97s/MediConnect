import axiosInstance from '../utils/axiosConfig';

export async function fetchMedicines(query = '') {
  const response = await axiosInstance.get('/medicines', {
    params: query ? { q: query } : {}
  });

  return response.data;
}