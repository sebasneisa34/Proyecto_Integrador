import axiosClient from '../api/axiosClient';

export async function getAuditoria() {
  const response = await axiosClient.get('/auditoria');
  return response.data;
}

export async function getAuditoriaById(id) {
  const response = await axiosClient.get(`/auditoria/${id}`);
  return response.data;
}