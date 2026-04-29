import api from './api';

export const getMyWinnings = () => api.get('/winners/my');
export const getAllWinners = () => api.get('/winners');
export const uploadProof = (winnerId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/winners/${winnerId}/upload-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const verifyWinner = (winnerId, status) => api.put(`/winners/${winnerId}/verify`, { status });

