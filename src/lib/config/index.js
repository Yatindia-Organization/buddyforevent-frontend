// import { API_URL } from '../../../../config';

// export const API_ROUTE = (url) => `${API_URL}/${url}`;

// export const THUMBNAIL_ROUTE = (url, size = 500) =>
//     `${API_URL}/media/thumbnail/${url}/${size}`;


export const API_ROUTE = import.meta.env.VITE_DOMAIN_NAME;
export const API_FRONTEND = import.meta.env.VITE_FRONTEND_URL;


// Standardized API request handler
export const apiRequest = async (endpoint, options = {}) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Default headers
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    // Add auth header if token exists
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    // Merge headers
    const headers = {
      ...defaultHeaders,
      ...options.headers,
    };
    
    // Remove Content-Type for file uploads or if explicitly set to null
    if (options.body instanceof FormData || options.headers?.['Content-Type'] === null) {
      delete headers['Content-Type'];
    }
    
    // Make the request
    const response = await fetch(`${API_ROUTE}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Handle auth errors globally
    if (response.status === 401) {
      // Token expired or invalid - clear auth data and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
      
      // Redirect to login (you might want to use your routing method)
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    return response;
    
  } catch (error) {
    // Re-throw the error so calling code can handle it
    throw error;
  }
};

// Helper for JSON responses
export const apiRequestJSON = async (endpoint, options = {}) => {
  const response = await apiRequest(endpoint, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }
  
  return response.json();
};

// Helper for blob responses (file downloads)
export const apiRequestBlob = async (endpoint, options = {}) => {
  const response = await apiRequest(endpoint, options);
  
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }
  
  return response.blob();
};