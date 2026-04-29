import api from './api';

export const getCharities = () => api.get('/charities');
export const createCharity = (data) => api.post('/charities', data);
export const updateCharity = (id, data) => api.put(`/charities/${id}`, data);
export const deleteCharity = (id) => api.delete(`/charities/${id}`);
export const getMyCharity = () => api.get('/charities/my');
export const setMyCharity = (data) => api.post('/charities/my', data);
export const updateMyCharity = (data) => api.put('/charities/my', data);
