import axios from 'axios';
import { authService } from './auth.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Intercepteur pour ajouter le token aux requêtes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est 401 et que nous n'avons pas déjà essayé de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Essayer de rafraîchir le token
        await authService.refreshTokens();
        
        // Mettre à jour le token dans la requête originale
        const token = authService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        
        // Réessayer la requête originale
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        await authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
