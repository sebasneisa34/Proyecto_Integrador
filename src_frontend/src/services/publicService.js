import axiosClient from '../api/axiosClient';

export async function getPublicNoticias(paisSlug) {
  const response = await axiosClient.get(
    `/public/paises/${paisSlug}/noticias`
  );

  return response.data;
}

export async function getPublicTestimonios(paisSlug) {
  const response = await axiosClient.get(
    `/public/paises/${paisSlug}/testimonios`
  );

  return response.data;
}