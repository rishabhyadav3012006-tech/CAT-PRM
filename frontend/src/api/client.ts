import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('carenest_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract data payload or handle auth expiration
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('carenest_token');
      localStorage.removeItem('carenest_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Modular API services
export const authApi = {
  login: (data: any) => apiClient.post('/auth/login', data),
  register: (data: any) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data: any) => apiClient.patch('/auth/profile', data),
  refreshToken: () => apiClient.post('/auth/refresh'),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) => apiClient.post('/auth/reset-password', data),
  verifyEmail: (data: { email: string; code: string }) => apiClient.post('/auth/verify-email', data),
  resendVerificationCode: (email: string) => apiClient.post('/auth/resend-code', { email }),
  lookupProfileInvite: (code: string) => apiClient.get(`/auth/profile-invite/${encodeURIComponent(code)}`),
  joinProfile: (data: { profileCode: string; relationship: string; notes?: string }) => apiClient.post('/auth/join-profile', data)
};

export const elderlyApi = {
  getAll: () => apiClient.get('/elderly'),
  getById: (id: string) => apiClient.get(`/elderly/${id}`),
  update: (id: string, data: any) => apiClient.patch(`/elderly/${id}`, data)
};

export const medicationsApi = {
  getAll: (elderlyId?: string, includeArchived?: boolean) =>
    apiClient.get('/medications', { params: { elderlyId, includeArchived } }),
  getById: (id: string) => apiClient.get(`/medications/${id}`),
  create: (data: any) => apiClient.post('/medications', data),
  update: (id: string, data: any) => apiClient.patch(`/medications/${id}`, data),
  archive: (id: string) => apiClient.post(`/medications/${id}/archive`),
  refill: (id: string, quantity?: number) => apiClient.post(`/medications/${id}/refill`, { quantity }),
  logAdherence: (data: any) => apiClient.post('/medications/adherence', data),
  getHistory: (elderlyId?: string, medicationId?: string) =>
    apiClient.get('/medications/history', { params: { elderlyId, medicationId } }),
  getStats: (elderlyId: string) => apiClient.get(`/medications/stats/${elderlyId}`)
};

export const appointmentsApi = {
  getAll: (elderlyId?: string, status?: string) =>
    apiClient.get('/appointments', { params: { elderlyId, status } }),
  getById: (id: string) => apiClient.get(`/appointments/${id}`),
  create: (data: any) => apiClient.post('/appointments', data),
  update: (id: string, data: any) => apiClient.patch(`/appointments/${id}`, data),
  reschedule: (id: string, data: { newDate: string; newTime?: string; reason?: string }) =>
    apiClient.post(`/appointments/${id}/reschedule`, data),
  cancel: (id: string, reason?: string) => apiClient.post(`/appointments/${id}/cancel`, { reason }),
  updateStatus: (id: string, status: string) => apiClient.patch(`/appointments/${id}/status`, { status }),
  addConsultationNotes: (id: string, consultationNotes: string) =>
    apiClient.post(`/appointments/${id}/consultation-notes`, { consultationNotes }),
  addDocument: (id: string, doc: { name: string; type: string; size?: string; url?: string }) =>
    apiClient.post(`/appointments/${id}/documents`, doc),
  delete: (id: string) => apiClient.delete(`/appointments/${id}`)
};

export const recordsApi = {
  getAll: (elderlyId?: string, limit?: number) => apiClient.get('/records', { params: { elderlyId, limit } }),
  create: (data: any) => apiClient.post('/records', data)
};

export const activitiesApi = {
  getAll: (elderlyId?: string, date?: string) => apiClient.get('/activities', { params: { elderlyId, date } }),
  create: (data: any) => apiClient.post('/activities', data),
  updateStatus: (id: string, status: string, notes?: string) => apiClient.patch(`/activities/${id}/status`, { status, notes })
};

export const alertsApi = {
  getEmergencyProfile: (elderlyId?: string) =>
    apiClient.get('/alerts/emergency-profile', { params: { elderlyId } }),
  triggerSos: (data: any) => apiClient.post('/alerts/sos', data),
  getActive: () => apiClient.get('/alerts/active'),
  resolve: (id: string, notes: string) => apiClient.patch(`/alerts/${id}/resolve`, { notes })
};

export const circleApi = {
  getMembers: (elderlyId?: string) => apiClient.get('/circle/members', { params: { elderlyId } }),
  createInvite: (data: any) => apiClient.post('/circle/invites', data),
  getInvites: (elderlyId?: string) => apiClient.get('/circle/invites', { params: { elderlyId } }),
  revokeInvite: (inviteId: string) => apiClient.post(`/circle/invites/${inviteId}/revoke`),
  joinCircle: (data: { code: string; relationship?: string; notes?: string }) =>
    apiClient.post('/circle/join', data),
  approveMember: (memberId: string) => apiClient.post(`/circle/members/${memberId}/approve`),
  rejectMember: (memberId: string, reason?: string) =>
    apiClient.post(`/circle/members/${memberId}/reject`, { reason }),
  updateRole: (memberId: string, role: string) =>
    apiClient.patch(`/circle/members/${memberId}/role`, { role }),
  updatePermissions: (memberId: string, permissions: any) =>
    apiClient.patch(`/circle/members/${memberId}/permissions`, { permissions }),
  revokeMember: (memberId: string) => apiClient.delete(`/circle/members/${memberId}`),
  getActivities: (elderlyId?: string) => apiClient.get('/circle/activities', { params: { elderlyId } })
};

export const vaultApi = {
  getAll: (elderlyId?: string, category?: string, isArchived?: boolean, q?: string) =>
    apiClient.get('/vault/documents', { params: { elderlyId, category, isArchived, q } }),
  getById: (id: string) => apiClient.get(`/vault/documents/${id}`),
  upload: (data: any) => apiClient.post('/vault/documents', data),
  update: (id: string, data: any) => apiClient.patch(`/vault/documents/${id}`, data),
  archive: (id: string) => apiClient.post(`/vault/documents/${id}/archive`),
  restore: (id: string) => apiClient.post(`/vault/documents/${id}/restore`),
  getSignedUrl: (id: string, expiresInMinutes: number = 15) =>
    apiClient.get(`/vault/documents/${id}/signed-url`, { params: { expiresInMinutes } }),
  getAuditLogs: (elderlyId?: string) => apiClient.get('/vault/audit-logs', { params: { elderlyId } }),
  delete: (id: string) => apiClient.delete(`/vault/documents/${id}`)
};

export const dashboardApi = {
  getOverview: (elderlyId?: string) => apiClient.get('/dashboard/overview', { params: { elderlyId } })
};

export const analyticsApi = {
  getOverview: (params?: { elderlyId?: string; period?: string; startDate?: string; endDate?: string }) =>
    apiClient.get('/analytics/overview', { params }),
  downloadReport: (params?: { elderlyId?: string; period?: string; startDate?: string; endDate?: string; format?: string }) =>
    apiClient.get('/analytics/report/download', {
      params,
      responseType: params?.format === 'json' ? 'json' : 'text'
    })
};


export const assistantApi = {
  getSummary: (elderlyId?: string) =>
    apiClient.get('/assistant/summary', { params: { elderlyId } }),
  chat: (message: string, elderlyId?: string) =>
    apiClient.post('/assistant/chat', { message, elderlyId }),
  logWellness: (data: any) =>
    apiClient.post('/assistant/wellness', data)
};
