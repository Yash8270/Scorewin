import api from './api';

export const getAnalytics = () => api.get('/admin/analytics');
export const getAdminUsers = () => api.get('/admin/users');
export const changeUserRole = (userId, role) => api.put(`/admin/users/${userId}/role`, { role });
