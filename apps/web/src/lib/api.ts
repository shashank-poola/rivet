const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Auth endpoints
  async signIn(email: string, password: string) {
    return this.post("/auth/signin", { email, password });
  }

  async signUp(email: string, password: string) {
    return this.post("/auth/signup", { email, password });
  }

  async logout() {
    return this.post("/logout", {});
  }

  async getPersonal() {
    return this.get("/personal");
  }

  // Workflows endpoints
  async getWorkflows() {
    return this.get("/workflows");
  }

  async createWorkflow(data: any) {
    return this.post("/workflows", data);
  }

  async updateWorkflow(workflowId: string, data: any) {
    return this.put(`/workflow-editor/${workflowId}`, data);
  }

  async getWorkflowById(workflowId: string) {
    return this.get(`/workflows/${workflowId}`);
  }

  async deleteWorkflow(workflowId: string) {
    return this.delete(`/workflows/${workflowId}`);
  }

  // Templates endpoint
  async getTemplates() {
    return this.get("/templates");
  }

  // Credentials endpoints
  async getCredentials() {
    return this.get("/credentials");
  }

  async createCredential(data: any) {
    return this.post("/credentials", data);
  }

  async updateCredential(credentialsId: string, data: any) {
    return this.put(`/credentials/${credentialsId}`, data);
  }

  async deleteCredential(credentialsId: string) {
    return this.delete(`/credentials/${credentialsId}`);
  }
}

export const api = new ApiClient(API_URL);
