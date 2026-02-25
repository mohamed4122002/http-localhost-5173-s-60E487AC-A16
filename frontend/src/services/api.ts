import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on login/signup
      if (!window.location.pathname.startsWith('/auth') && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/token', formData);
    return response.data;
  },
  signup: async (data: { username: string; email?: string; password: string }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: async () => {
    await api.post('/auth/logout');
  },
};

export const templates = {
  list: async () => (await api.get('/templates/')).data,
  create: async (data: any) => (await api.post('/templates/', data)).data,
  update: async (id: string, data: any) => (await api.put(`/templates/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/templates/${id}`)).data,
  get: async (id: string) => (await api.get(`/templates/${id}`)).data,
  getHistory: async (name: string) => (await api.get(`/templates/history/${name}`)).data,
  rollback: async (id: string) => (await api.post(`/templates/rollback/${id}`)).data,
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return (await api.post('/templates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
  },
};

export const surveys = {
  list: async () => (await api.get('/surveys/')).data,
  create: async (data: any) => (await api.post('/surveys/', data)).data,
  get: async (id: string) => (await api.get(`/surveys/${id}`)).data,
  update: async (id: string, data: any) => (await api.put(`/surveys/${id}`, data)).data,
  delete: async (id: string) => (await api.delete(`/surveys/${id}`)).data,
  stats: async () => (await api.get('/surveys/stats')).data,
};

export const tokens = {
  generate: async (surveyId: string, count: number) =>
    (await api.post('/tokens/generate', { survey_id: surveyId, count })).data,
  listBySurvey: async (surveyId: string, params: { status?: string; batch_id?: string; page?: number; page_size?: number } = {}) =>
    (await api.get(`/tokens/survey/${surveyId}`, { params })).data,
  bulkUpdate: async (data: { token_ids: string[]; status?: string; expires_at?: string }) =>
    (await api.post('/tokens/bulk-update', data)).data,
  getSummary: async (surveyId: string) =>
    (await api.get(`/tokens/survey/${surveyId}/summary`)).data,
};

export const analytics = {
  getFunnel: async (surveyId: string) =>
    (await api.get(`/analytics/funnel/${surveyId}`)).data,
  getTrends: async (surveyId: string, days: number = 30) =>
    (await api.get(`/analytics/trends/${surveyId}?days=${days}`)).data,
  getOrphans: async () =>
    (await api.get('/analytics/orphans')).data,
  getOrphanDetails: async (reason: string) =>
    (await api.get(`/analytics/orphans/${reason}`)).data,
};

export const publicApi = {
  getSurvey: async (token: string) => (await api.get(`/s/${token}`)).data,
  submitLayer1: async (token: string, answers: any, phone: string) =>
    (await api.post(`/s/${token}/layer1`, { answers, phone })).data,
  submitLayer2: async (token: string, answers: any) =>
    (await api.post(`/s/${token}/layer2`, answers)).data,
};

export default api;
