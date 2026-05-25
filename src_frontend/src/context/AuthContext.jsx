import { useCallback, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { AuthContext } from './authContext';

function normalizeUser(rawUser) {
  if (!rawUser) return null;

  return {
    ...rawUser,
    rol:
      typeof rawUser.rol === 'object'
        ? rawUser.rol?.nombre
        : rawUser.rol,
    pais:
      rawUser.pais && typeof rawUser.pais === 'object'
        ? rawUser.pais
        : rawUser.pais || null
  };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? normalizeUser(JSON.parse(storedUser)) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const login = useCallback(async (username, password) => {
    const response = await axiosClient.post('/auth/login', {
      username,
      password
    });

    const { token: newToken, user: loggedUser } = response.data;
    const normalizedUser = normalizeUser(loggedUser);

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));

    setToken(newToken);
    setUser(normalizedUser);

    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
  }, []);

  const updateMyProfile = useCallback(async (profileData) => {
    const response = await axiosClient.patch('/auth/me', profileData);

    const normalizedUser = normalizeUser(response.data.user);

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);

    return {
      ...response.data,
      user: normalizedUser
    };
  }, []);

  const changeMyPassword = useCallback(async (currentPassword, newPassword) => {
    const response = await axiosClient.patch('/auth/change-my-password', {
      currentPassword,
      newPassword
    });

    return response.data;
  }, []);

  const setSecurityQuestion = useCallback(async (pregunta, respuesta) => {
    const response = await axiosClient.patch('/auth/security-question', {
      pregunta,
      respuesta
    });

    return response.data;
  }, []);

  const getSecurityQuestion = useCallback(async (username) => {
    const response = await axiosClient.post('/auth/security-question', {
      username
    });

    return response.data;
  }, []);

  const forgotPassword = useCallback(async (username, respuesta, newPassword) => {
    const response = await axiosClient.post('/auth/forgot-password', {
      username,
      respuesta,
      newPassword
    });

    return response.data;
  }, []);

  const getMySecurityQuestion = useCallback(async () => {
  const response = await axiosClient.get('/auth/security-question/me');

  return response.data;
  }, []);
  
  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateMyProfile,
      changeMyPassword,
      setSecurityQuestion,
      getSecurityQuestion,
      forgotPassword,
      getMySecurityQuestion
    }),
    [
      token,
      user,
      login,
      logout,
      updateMyProfile,
      changeMyPassword,
      setSecurityQuestion,
      getSecurityQuestion,
      forgotPassword,
      getMySecurityQuestion
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}