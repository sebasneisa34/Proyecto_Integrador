import axiosClient from '../api/axiosClient';

export async function getUsers() {
  const response = await axiosClient.get('/users');
  return response.data;
}

export async function getUserById(id) {
  const response = await axiosClient.get('/users');
  const users = response.data;
  return users.find((user) => Number(user.id) === Number(id)) || null;
}

export async function createUser(data) {
  const response = await axiosClient.post('/users', data);
  return response.data;
}

export async function updateUser(id, data) {
  const response = await axiosClient.put(`/users/${id}`, data);
  return response.data;
}

export async function updateUserPartial(id, data) {
  const response = await axiosClient.patch(`/users/${id}`, data);
  return response.data;
}

export async function changeUserPassword(id, newPassword) {
  const response = await axiosClient.patch(`/users/${id}/password`, {
    newPassword
  });

  return response.data;
}

export async function deactivateUser(id) {
  const response = await axiosClient.delete(`/users/${id}`);
  return response.data;
}

export async function deleteUserPermanently(id) {
  const response = await axiosClient.delete(`/users/${id}/permanent`);
  return response.data;
}