import axiosClient from '../api/axiosClient';

export async function getSolicitudes() {
  const response = await axiosClient.get('/solicitudes');
  return response.data;
}

export async function getSolicitudById(id) {
  const response = await axiosClient.get(`/solicitudes/${id}`);
  return response.data;
}

export async function updateSolicitud(id, data) {
  const response = await axiosClient.put(`/solicitudes/${id}`, data);
  return response.data;
}

export async function updateSolicitudPartial(id, data) {
  const response = await axiosClient.patch(`/solicitudes/${id}`, data);
  return response.data;
}

export async function updateSolicitudEstado(id, estado, observaciones_admin) {
  const response = await axiosClient.patch(`/solicitudes/${id}/estado`, {
    estado,
    observaciones_admin
  });

  return response.data;
}

export async function deleteSolicitud(id) {
  const response = await axiosClient.delete(`/solicitudes/${id}`);
  return response.data;
}