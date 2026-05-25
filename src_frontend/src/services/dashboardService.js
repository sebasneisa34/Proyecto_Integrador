import axiosClient from '../api/axiosClient';

async function safeRequest(callback, fallback = []) {
  try {
    const response = await callback();
    return response.data;
  } catch {
    return fallback;
  }
}

export async function getDashboardData() {
  const [noticias, testimonios, solicitudes, usuarios, auditoria] =
    await Promise.all([
      safeRequest(() => axiosClient.get('/noticias')),
      safeRequest(() => axiosClient.get('/testimonios')),
      safeRequest(() => axiosClient.get('/solicitudes')),
      safeRequest(() => axiosClient.get('/users')),
      safeRequest(() => axiosClient.get('/auditoria'))
    ]);

  return {
    noticias,
    testimonios,
    solicitudes,
    usuarios,
    auditoria
  };
}