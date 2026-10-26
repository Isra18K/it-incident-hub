import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export const getIncidents = () => axios.get(`${API_URL}/incidents`);
export const createIncident = (data) => axios.post(`${API_URL}/incidents`, data);
export const updateStatus = (id, status) => axios.patch(`${API_URL}/incidents/${id}/status`, { status });
export const assignTechnician = (id, assigned_technician) => axios.put(`${API_URL}/incidents/${id}/assign`, { assigned_technician });
export const addComment = (id, comment, author) => axios.post(`${API_URL}/incidents/${id}/comments`, { comment, author });