import axiosClient from '../api/axiosClient';

export async function getNoticias() {
  const response = await axiosClient.get('/noticias');
  return response.data;
}

export async function getNoticiaById(id) {
  const response = await axiosClient.get(`/noticias/${id}`);
  return response.data;
}

export async function createNoticia(data) {
  const response = await axiosClient.post('/noticias', data);
  return response.data;
}

export async function updateNoticia(id, data) {
  const response = await axiosClient.put(`/noticias/${id}`, data);
  return response.data;
}

export async function updateNoticiaEstado(id, estado) {
  const response = await axiosClient.patch(`/noticias/${id}/estado`, {
    estado
  });

  return response.data;
}

export async function deleteNoticia(id) {
  const response = await axiosClient.delete(`/noticias/${id}`);
  return response.data;
}

export async function uploadNoticiaImage(id, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.patch(
    `/noticias/${id}/imagen`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
}