import axiosClient from '../api/axiosClient';

export async function getTestimonios() {
  const response = await axiosClient.get('/testimonios');
  return response.data;
}

export async function getTestimonioById(id) {
  const response = await axiosClient.get(`/testimonios/${id}`);
  return response.data;
}

export async function createTestimonio(data) {
  const response = await axiosClient.post('/testimonios', data);
  return response.data;
}

export async function updateTestimonio(id, data) {
  const response = await axiosClient.put(`/testimonios/${id}`, data);
  return response.data;
}

export async function updateTestimonioEstado(id, estado) {
  const response = await axiosClient.patch(`/testimonios/${id}/estado`, {
    estado
  });

  return response.data;
}

export async function deleteTestimonio(id) {
  const response = await axiosClient.delete(`/testimonios/${id}`);
  return response.data;
}

export async function uploadTestimonioFoto(id, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.patch(
    `/testimonios/${id}/foto`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  );

  return response.data;
}