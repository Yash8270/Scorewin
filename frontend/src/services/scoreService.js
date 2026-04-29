import api from './api';

export const getMyScores = () => api.get('/scores/my');
export const addScore = (data) => api.post('/scores', data);
export const deleteScore = (id) => api.delete(`/scores/${id}`);
