import api from './api';

export const getMySubscription = () => api.get('/subscriptions/my');
export const createSubscription = (plan) => api.post('/subscriptions', { plan });
export const cancelSubscription = (id) => api.post(`/subscriptions/${id}/cancel`);
export const extendSubscription = (plan) => api.post('/subscriptions/extend', { plan });
export const renewSubscription = (plan) => api.post('/subscriptions/renew', { plan });
export const getAllSubscriptions = () => api.get('/subscriptions');
