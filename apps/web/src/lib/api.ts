const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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

  // Auth
  async me() { return this.get("/auth/me"); }
  async signIn(email: string, password: string) { return this.post("/auth/signin", { email, password }); }
  async signUp(email: string, password: string) { return this.post("/auth/signup", { email, password }); }
  async logout() { return this.post("/auth/logout"); }

  // Workflows
  async getWorkflows() { return this.get("/workflow/"); }
  async createWorkflow(data: any) { return this.post("/workflow/create", data); }
  async getWorkflowById(id: string) { return this.get(`/workflow/${id}`); }
  async updateWorkflow(id: string, data: any) { return this.put(`/workflow/${id}`, data); }
  async deleteWorkflow(id: string) { return this.delete(`/workflow/${id}`); }

  // Credentials
  async getCredentials() { return this.get("/cred/"); }
  async createCredential(data: any) { return this.post("/cred/create", data); }
  async updateCredential(id: string, data: any) { return this.put(`/cred/${id}`, data); }
  async deleteCredential(id: string) { return this.delete(`/cred/${id}`); }

  // Executions
  async getExecutions() { return this.get("/execution/"); }
  async executeWorkflow(workflowId: string) { return this.post("/execution/", { workflowId }); }

  // Analytics
  async getAnalytics() { return this.get("/analytic/"); }
}

export const api = new ApiClient(API_URL);
