import axiosInstance from '../utils/axiosConfig';

export async function fetchPrescriptions(params = {}) {
  const response = await axiosInstance.get('/prescriptions', { params });
  return response.data;
}

export async function finalizeConsultationPrescription(payload) {
  const response = await axiosInstance.post('/prescriptions/complete', payload);
  return response.data;
}

export async function downloadPrescriptionPdf(prescriptionId) {
  const response = await axiosInstance.get(`/prescriptions/${prescriptionId}/pdf`, {
    responseType: 'blob'
  });

  return {
    blob: response.data,
    fileName: extractFileName(response.headers?.['content-disposition'], prescriptionId)
  };
}

function extractFileName(contentDisposition, prescriptionId) {
  const match = /filename="?([^"]+)"?/i.exec(contentDisposition || '');
  if (match?.[1]) {
    return match[1];
  }

  return `prescription-${prescriptionId}.pdf`;
}

export function triggerPdfDownload(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
