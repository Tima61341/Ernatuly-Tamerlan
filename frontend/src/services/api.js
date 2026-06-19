import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const lang = localStorage.getItem('language') || 'ru';
    config.headers['Accept-Language'] = lang;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api(error.config);
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  changeRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  toggleActive: (id) => api.put(`/users/${id}/toggle-active`),
  delete: (id) => api.delete(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/profile/password', data),
};

// Topic API
export const topicAPI = {
  getAll: () => api.get('/topics'),
  getAllIncludingInactive: () => api.get('/topics/all'),
  getById: (id) => api.get(`/topics/${id}`),
  create: (data) => api.post('/topics', data),
  update: (id, data) => api.put(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`),
  search: (q) => api.get(`/topics/search?q=${q}`),
};

// Quiz API
export const quizAPI = {
  getPublic: () => api.get('/quizzes/public'),
  getMy: () => api.get('/quizzes/my'),
  getAll: () => api.get('/quizzes'),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  search: (q) => api.get(`/quizzes/public/search?q=${q}`),
  getByTopic: (topicId) => api.get(`/quizzes/public/topic/${topicId}`),
  getPopular: (limit = 10) => api.get(`/quizzes/public/popular?limit=${limit}`),
  addQuestion: (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data),
  updateQuestion: (questionId, data) => api.put(`/quizzes/questions/${questionId}`, data),
  deleteQuestion: (questionId) => api.delete(`/quizzes/questions/${questionId}`),
};

// Game API
export const gameAPI = {
  create: (data) => api.post('/game/create', data),
  join: (data) => api.post('/game/join', data),
  start: (gameCode) => api.post(`/game/${gameCode}/start`),
  nextQuestion: (gameCode) => api.post(`/game/${gameCode}/next`),
  end: (gameCode) => api.post(`/game/${gameCode}/end`),
  getState: (gameCode) => api.get(`/game/${gameCode}/state`),
  getPlayerState: (playerToken) => api.get(`/game/play/${playerToken}/state`),
  submitAnswer: (data) => api.post('/game/play/answer', data),
  disconnect: (playerToken) => api.post(`/game/play/${playerToken}/disconnect`),
  getLeaderboard: (gameCode) => api.get(`/game/${gameCode}/leaderboard`),
  getHosted: () => api.get('/game/hosted'),
};

// AI API
export const aiAPI = {
  generateQuestions: (data) => api.post('/ai/generate-questions', data),
  generateForQuiz: (data) => api.post('/ai/generate-for-quiz', data),
};

// Statistics API
export const statsAPI = {
  getAdminDashboard: () => api.get('/statistics/admin/dashboard'),
  getCreatorDashboard: () => api.get('/statistics/creator/dashboard'),
};

export default api;
