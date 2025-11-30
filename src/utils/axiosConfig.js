import axios from 'axios';

// Базовый URL для API запросов
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Устанавливаем базовый URL для всех axios запросов
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Настройка axios для автоматической отправки токена
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ошибок авторизации
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истёк или недействителен
      localStorage.removeItem('token');
      localStorage.removeItem('employee');
      // Перенаправление на страницу входа только если мы не на странице логина/регистрации
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Экспортируем настроенный axios
export default axios;

