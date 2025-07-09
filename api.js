import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
});

// ✅ FIXED: POST to the correct route
export const compareReports = (data) => API.post('/analyze', data);

// Optionally fix other routes when you define them in backend
export const getDiet = (data) => API.post('/compare', data); // reuse if same
export const getPrompt = (data) => API.post('/chat', data); // reuse if same
