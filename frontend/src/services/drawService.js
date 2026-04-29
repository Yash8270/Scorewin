import api from './api';

export const getDraws = () => api.get('/draws');
export const getDraw = (id) => api.get(`/draws/${id}`);
export const getDrawResults = (id) => api.get(`/draws/${id}/results`);
export const runDraw = (draw_type) => api.post('/draws/run', { draw_type });
export const simulateDraw = (draw_type) => api.post('/draws/simulate', { draw_type });
export const publishDraw = (id) => api.post(`/draws/${id}/publish`);
