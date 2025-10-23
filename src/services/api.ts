import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.100:8000/api", // Cambia según tu API
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
