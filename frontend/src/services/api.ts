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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('mentr-refresh-token');
      if (refreshToken) {
        return authApi.refreshToken(refreshToken).then((res) => {
          localStorage.setItem('mentr-token', res.data.accessToken);
          localStorage.setItem('mentr-refresh-token', res.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api.request(error.config);
        }).catch(() => {
          localStorage.removeItem('mentr-token');
          localStorage.removeItem('mentr-refresh-token');
          window.location.href = '/auth';
          return Promise.reject(error);
        });
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  signUp: (data: { name: string; email: string; username: string; password: string; role?: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
};

// Mentor APIs
export const mentorApi = {
  getTrending: (limit: number = 5) => api.get(`/mentors/trending?limit=${limit}`),
  search: (params: { q?: string; skills?: string; languages?: string; pronouns?: string; sort?: string; page?: number; size?: number }) =>
    api.get('/mentors', { params }),
  getById: (mentorId: string) => api.get(`/mentors/${mentorId}`),
  getReviews: (mentorId: string, page: number = 0, size: number = 10) =>
    api.get(`/mentors/${mentorId}/reviews`, { params: { page, size } }),
  getRatingsSummary: (mentorId: string) => api.get(`/mentors/${mentorId}/ratings-summary`),
  getAvailability: (mentorId: string) => api.get(`/mentors/${mentorId}/availability`),
  getCalendar: (mentorId: string, from: string, to: string, durationMinutes: number = 15) =>
    api.get(`/mentors/${mentorId}/calendar`, { params: { from, to, durationMinutes } }),
  getProfile: () => api.get('/mentors/profile'),
  updateProfile: (data: any) => api.put('/mentors/profile', data),
  setPresenceLive: () => api.post('/mentors/presence/live'),
  setPresenceOffline: () => api.post('/mentors/presence/offline'),
  heartbeat: () => api.post('/mentors/presence/heartbeat'),
  getPresence: () => api.get('/mentors/presence'),
};

// Booking APIs
export const bookingApi = {
  create: (data: { mentorId: number; bookingType: string; bookingTime?: string; durationMinutes: number; startTime?: string; endTime?: string }) =>
    api.post('/bookings', data),
  updateStatus: (bookingId: string, data: any) => api.patch(`/bookings/${bookingId}`, data),
  getLearnerBookings: () => api.get('/bookings/learner'),
  getMentorBookings: () => api.get('/bookings/mentor'),
  cancel: (bookingId: string, data: { refundDestination: string; reason: string }) =>
    api.post(`/bookings/${bookingId}/cancel`, data),
};

// Session APIs
export const sessionApi = {
  getById: (id: string) => api.get(`/sessions/${id}`),
  updateStatus: (id: string, newStatus: string) => api.patch(`/sessions/${id}/status`, { newStatus }),
  getMentorSessions: (mentorId: string) => api.get(`/sessions/mentor/${mentorId}`),
  getLearnerSessions: (learnerId: string) => api.get(`/sessions/learner/${learnerId}`),
  endSession: (id: string) => api.post(`/sessions/${id}/end`),
  joinSession: (sessionId: string) => api.post(`/sessions/${sessionId}/join`),
};

// Review APIs
export const reviewApi = {
  create: (sessionId: string, data: { rating: number; comment: string }) =>
    api.post(`/sessions/${sessionId}/reviews`, data),
  getMentorReviews: (mentorId: string) => api.get(`/reviews/mentor/${mentorId}`),
};

// Note APIs
export const noteApi = {
  create: (sessionId: string, data: any) => api.post(`/sessions/${sessionId}/notes`, data),
  getAll: (sessionId: string) => api.get(`/sessions/${sessionId}/notes`),
};

// User APIs
export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: { fullName?: string; bio?: string }) => api.put('/users/me', data),
  uploadProfileImage: (file: File, idempotencyKey: string) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/users/me/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data', 'Idempotency-Key': idempotencyKey },
    });
  },
  getProfileImage: () => api.get('/users/me/profile-image'),
  deleteProfileImage: () => api.delete('/users/me/profile-image'),
};

// Dashboard APIs
export const dashboardApi = {
  getMentorSessions: (page: number = 0, size: number = 10) =>
    api.get('/mentor/dashboard/sessions', { params: { page, size } }),
  getMentorBookings: (page: number = 0, size: number = 10) =>
    api.get('/mentor/dashboard/bookings', { params: { page, size } }),
  getMentorAvailability: (page: number = 0, size: number = 10) =>
    api.get('/mentor/dashboard/availability', { params: { page, size } }),
  getLearnerSessions: (page: number = 0, size: number = 10) =>
    api.get('/learner/dashboard/sessions', { params: { page, size } }),
  getLearnerBookings: (page: number = 0, size: number = 10) =>
    api.get('/learner/dashboard/bookings', { params: { page, size } }),
  getMentorSummary: (range: string = '30d') =>
    api.get('/mentor/dashboard/summary', { params: { range } }),
  getMentorTimeseries: (metric: string = 'sessions', range: string = '30d', interval: string = 'day') =>
    api.get('/mentor/dashboard/timeseries', { params: { metric, range, interval } }),
};

// Availability APIs
export const availabilityApi = {
  create: (data: any) => api.post('/mentor/availability', data),
  getAll: () => api.get('/mentor/availability'),
  delete: (slotId: string) => api.delete(`/mentor/availability/${slotId}`),
};

// Chat APIs
export const chatApi = {
  checkEligibility: (mentorId: string) => api.get(`/chat/mentor/${mentorId}/eligibility`),
  getAccess: (mentorId: string) => api.get(`/chat/mentor/${mentorId}/access`),
  mentorOpenConversation: (learnerId: string) => api.post(`/chat/conversations/learner/${learnerId}`),
  sendMessage: (data: { conversationId: string; type: string; text: string }) =>
    api.post('/chat/messages', data),
};

// Talk Now APIs
export const talkNowApi = {
  start: (data: { mentorId: number; durationMinutes: number }) =>
    api.post('/talk-now/start', data),
  getActiveRequest: () => api.get('/talk-now/active'),
  accept: (bookingId: string) => api.post(`/talk-now/${bookingId}/accept`),
  decline: (bookingId: string) => api.post(`/talk-now/${bookingId}/decline`),
};

// Session Extension APIs
export const sessionExtensionApi = {
  request: (sessionId: string) => api.post(`/sessions/${sessionId}/extensions/request`),
  offer: (sessionId: string) => api.post(`/sessions/${sessionId}/extensions/offer`),
  approve: (sessionId: string, extensionId: string) =>
    api.post(`/sessions/${sessionId}/extensions/${extensionId}/approve`),
  accept: (sessionId: string, extensionId: string) =>
    api.post(`/sessions/${sessionId}/extensions/${extensionId}/accept`),
  decline: (sessionId: string, extensionId: string) =>
    api.post(`/sessions/${sessionId}/extensions/${extensionId}/decline`),
  cancel: (sessionId: string, extensionId: string) =>
    api.post(`/sessions/${sessionId}/extensions/${extensionId}/cancel`),
  createPaymentIntent: (sessionId: string, extensionId: string) =>
    api.post(`/sessions/${sessionId}/extensions/${extensionId}/payment-intent`),
  getActive: (sessionId: string) => api.get(`/sessions/${sessionId}/extensions/active`),
};

// Mentor Shorts APIs
export const mentorShortsApi = {
  reserve: (data: any, idempotencyKey: string) =>
    api.post('/mentors/me/shorts/reserve', data, { headers: { 'Idempotency-Key': idempotencyKey } }),
  finalize: (uploadId: string) => api.post(`/mentors/me/shorts/${uploadId}/finalize`),
  getAll: () => api.get('/mentors/me/shorts'),
  delete: (uploadId: string) => api.delete(`/mentors/me/shorts/${uploadId}`),
};

// Meta APIs
export const metaApi = {
  searchLanguages: (q: string = '', limit: number = 20) =>
    api.get('/meta/languages', { params: { q, limit } }),
  searchTags: (q: string = '', limit: number = 20) =>
    api.get('/meta/tags', { params: { q, limit } }),
  getPronouns: () => api.get('/meta/pronouns'),
};

// Admin APIs (client-side aggregation from existing endpoints)
export const adminApi = {
  // Uses mentor search to list all mentors
  getAllMentors: (page = 0, size = 20) =>
    api.get('/mentors', { params: { page, size } }),
  getMentorById: (mentorId: string) => api.get(`/mentors/${mentorId}`),
  // Dashboard KPI reuse
  getMentorSummary: (range = '30d') =>
    api.get('/mentor/dashboard/summary', { params: { range } }),
  getMentorTimeseries: (metric: string, range = '30d', interval = 'day') =>
    api.get('/mentor/dashboard/timeseries', { params: { metric, range, interval } }),
  // Session and booking overviews
  getAllSessions: (page = 0, size = 20) =>
    api.get('/mentor/dashboard/sessions', { params: { page, size } }),
  getAllBookings: (page = 0, size = 20) =>
    api.get('/mentor/dashboard/bookings', { params: { page, size } }),
};

export default api;
