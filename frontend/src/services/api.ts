import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mentr-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mentor APIs
export const mentorApi = {
  getTrending: () => api.get('/mentors/trending'),
  getOnline: () => api.get('/mentors/online'),
  search: (query: string, tab: string = 'experts') =>
    api.get(`/mentors/search?q=${encodeURIComponent(query)}&tab=${tab}`),
  getById: (id: string) => api.get(`/mentors/${id}`),
  getReviews: (id: string) => api.get(`/mentors/${id}/reviews`),
  getVideos: (id: string) => api.get(`/mentors/${id}/videos`),
  follow: (id: string) => api.post(`/mentors/${id}/follow`),
};

// Session APIs
export const sessionApi = {
  book: (data: { mentorId: string; date: string; time: string; subject: string }) =>
    api.post('/sessions/book', data),
  getUpcoming: () => api.get('/sessions/upcoming'),
  getPast: () => api.get('/sessions/past'),
  getById: (id: string) => api.get(`/sessions/${id}`),
  cancel: (id: string) => api.put(`/sessions/${id}/cancel`),
  rate: (id: string, rating: number, review: string) =>
    api.post(`/sessions/${id}/rate`, { rating, review }),
};

// Payment APIs
export const paymentApi = {
  create: (data: {
    sessionId: string;
    paymentMethod: string;
    cardNumber?: string;
    cardHolder?: string;
    expDate?: string;
    cvv?: string;
    couponCode?: string;
  }) => api.post('/payments', data),
  getById: (id: string) => api.get(`/payments/${id}`),
  getReceipt: (id: string) => api.get(`/payments/${id}/receipt`),
};

// Auth APIs
export const authApi = {
  signUp: (data: {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    password: string;
  }) => api.post('/auth/signup', data),
  signIn: (data: { username: string; password: string }) =>
    api.post('/auth/signin', data),
  socialLogin: (provider: string, token: string) =>
    api.post('/auth/social', { provider, token }),
};

// User APIs
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getCallHistory: () => api.get('/users/call-history'),
};

// Message APIs
export const messageApi = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  send: (data: { receiverId: string; type: string; content: string }) =>
    api.post('/messages', data),
};

// Video APIs
export const videoApi = {
  getTrending: () => api.get('/videos/trending'),
  getLive: () => api.get('/videos/live'),
  getById: (id: string) => api.get(`/videos/${id}`),
  getComments: (id: string) => api.get(`/videos/${id}/comments`),
  addComment: (id: string, text: string) =>
    api.post(`/videos/${id}/comments`, { text }),
};

// Support APIs
export const supportApi = {
  getFaqs: () => api.get('/support/faqs'),
  reportIssue: (data: {
    category: string;
    description: string;
    sessionId?: string;
    requestRefund?: boolean;
  }) => api.post('/support/report', data),
};

export default api;
