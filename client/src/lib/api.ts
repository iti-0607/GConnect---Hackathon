import { apiRequest } from "./queryClient";

const API_BASE = "";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  income?: number;
  occupation?: string;
  state?: string;
  district?: string;
}

export interface ChatMessage {
  message: string;
  language?: string;
}

// Auth API
export const authAPI = {
  login: async (data: LoginRequest) => {
    const response = await apiRequest("POST", `${API_BASE}/api/auth/login`, data);
    return response.json();
  },

  register: async (data: RegisterRequest) => {
    const response = await apiRequest("POST", `${API_BASE}/api/auth/register`, data);
    return response.json();
  },

  getMe: async (token: string) => {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },
};

// Profile API
export const profileAPI = {
  update: async (data: ProfileUpdate) => {
    const response = await apiRequest("PUT", `${API_BASE}/api/profile`, data);
    return response.json();
  },
};

// Schemes API
export const schemesAPI = {
  getAll: async (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (category) params.append("category", category);
    
    const response = await fetch(`${API_BASE}/api/schemes?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch schemes");
    return response.json();
  },

  getRecommended: async () => {
    const response = await apiRequest("GET", `${API_BASE}/api/schemes/recommended`);
    return response.json();
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE}/api/schemes/${id}`);
    if (!response.ok) throw new Error("Failed to fetch scheme");
    return response.json();
  },
};

// Applications API
export const applicationsAPI = {
  getAll: async () => {
    const response = await apiRequest("GET", `${API_BASE}/api/applications`);
    return response.json();
  },

  create: async (data: { schemeId: number; applicationId?: string; notes?: string }) => {
    const response = await apiRequest("POST", `${API_BASE}/api/applications`, data);
    return response.json();
  },

  updateStatus: async (id: number, status: string, notes?: string) => {
    const response = await apiRequest("PUT", `${API_BASE}/api/applications/${id}`, { status, notes });
    return response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async () => {
    const response = await apiRequest("GET", `${API_BASE}/api/notifications`);
    return response.json();
  },

  markRead: async (id: number) => {
    const response = await apiRequest("PUT", `${API_BASE}/api/notifications/${id}/read`);
    return response.json();
  },

  markAllRead: async () => {
    const response = await apiRequest("PUT", `${API_BASE}/api/notifications/read-all`);
    return response.json();
  },
};

// Chat API
export const chatAPI = {
  sendMessage: async (data: ChatMessage) => {
    const response = await apiRequest("POST", `${API_BASE}/api/chat`, data);
    return response.json();
  },

  getHistory: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : "";
    const response = await apiRequest("GET", `${API_BASE}/api/chat/history${params}`);
    return response.json();
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await apiRequest("GET", `${API_BASE}/api/dashboard/stats`);
    return response.json();
  },
};
