// API Service Layer for IceDepth Pro

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  register: async (email, password, name) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store token
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: async () => {
    return fetchWithAuth(`${API_BASE_URL}/auth/me`);
  }
};

// Measurements API
export const measurementsAPI = {
  getMeasurements: async (rinkId) => {
    return fetchWithAuth(`${API_BASE_URL}/measurements/${rinkId}`);
  },

  saveMeasurement: async (rinkId, pointId, depth, notes) => {
    return fetchWithAuth(`${API_BASE_URL}/measurements`, {
      method: 'POST',
      body: JSON.stringify({ rinkId, pointId, depth, notes })
    });
  },

  deleteMeasurement: async (rinkId, pointId) => {
    return fetchWithAuth(`${API_BASE_URL}/measurements/${rinkId}/${pointId}`, {
      method: 'DELETE'
    });
  },

  getHistory: async (rinkId, limit = 100) => {
    return fetchWithAuth(`${API_BASE_URL}/measurements/history/${rinkId}?limit=${limit}`);
  },

  getAnalytics: async (rinkId) => {
    return fetchWithAuth(`${API_BASE_URL}/measurements/analytics/${rinkId}`);
  }
};

// Check if API is available
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch (error) {
    console.warn('API not available, using local storage fallback');
    return false;
  }
};

// Fallback to localStorage if API is not available
export const useLocalStorage = !import.meta.env.VITE_API_URL;
