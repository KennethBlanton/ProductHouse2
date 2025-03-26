import axios from 'axios';
import { Auth } from 'aws-amplify';

// Create axios instance with base URL from environment variables
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add request interceptor to add authorization header
api.interceptors.request.use(
  async (config) => {
    try {
      // Get current authenticated user's session
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
      
      // Add authorization header
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      // If no session exists, continue without authorization header
      console.log('No active session found');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common error scenarios
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401) {
      // Refresh token or redirect to login
      try {
        await Auth.currentSession();
        // If session refresh successful, retry the original request
        return api(error.config);
      } catch (refreshError) {
        // If session refresh fails, redirect to login page
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // Handle forbidden access (403)
    if (error.response?.status === 403) {
      console.error('Access forbidden to resource');
    }
    
    // Handle not found (404)
    if (error.response?.status === 404) {
      console.error('Resource not found');
    }
    
    // Handle server errors (500+)
    if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// API request methods with typed responses
export const apiClient = {
  // User endpoints
  async getUser() {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  async updateUser(userData: any) {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
  
  // Project endpoints
  async getProjects() {
    const response = await api.get('/projects');
    return response.data;
  },
  
  async getProject(projectId: string) {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },
  
  async createProject(projectData: any) {
    const response = await api.post('/projects', projectData);
    return response.data;
  },
  
  async updateProject(projectId: string, projectData: any) {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },
  
  async deleteProject(projectId: string) {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },
  
  // Claude conversation endpoints
  async startConversation(projectId: string) {
    const response = await api.post(`/claude/conversations`, { projectId });
    return response.data;
  },
  
  async sendMessage(conversationId: string, message: string) {
    const response = await api.post(`/claude/conversations/${conversationId}/messages`, { 
      content: message 
    });
    return response.data;
  },
  
  async getConversation(conversationId: string) {
    const response = await api.get(`/claude/conversations/${conversationId}`);
    return response.data;
  },
  
  // Project plan generation endpoints
  async generatePlan(projectId: string, planParameters: any) {
    const response = await api.post(`/claude/projects/${projectId}/plan`, planParameters);
    return response.data;
  },
  
  // Export endpoints
  async exportPlanToPdf(projectId: string) {
    const response = await api.get(`/exports/projects/${projectId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  async exportPlanToMarkdown(projectId: string) {
    const response = await api.get(`/exports/projects/${projectId}/markdown`);
    return response.data;
  },
  
  // Integration endpoints
  async connectJira(connectionData: any) {
    const response = await api.post('/integrations/jira/connect', connectionData);
    return response.data;
  },
  
  async syncWithJira(projectId: string) {
    const response = await api.post(`/integrations/jira/sync/${projectId}`);
    return response.data;
  },
};

export default apiClient;