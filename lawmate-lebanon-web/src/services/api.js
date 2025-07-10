import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: 'https://lawmate-hj6p.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
};

// Documents API
export const documentsAPI = {
  getDocuments: () => api.get('/documents'),
  getDocument: (id) => api.get(`/documents/${id}`),
  createDocument: (documentData) => api.post('/documents', documentData),
  updateDocument: (id, documentData) => api.put(`/documents/${id}`, documentData),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
};

// Subscription API
export const subscriptionAPI = {
  updateSubscription: (subscriptionData) => api.post('/subscription', subscriptionData),
};

// User Documents API (for file uploads)
export const userDocumentsAPI = {
  uploadDocuments: (formData) => {
    return api.post('/upload-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getUserDocuments: () => api.get('/profile'),
};

export const networkAPI = {
  getLawyers: () => api.get('/lawyers'),
  getMokhtars: () => api.get('/mokhtars'),
};


export default api;
