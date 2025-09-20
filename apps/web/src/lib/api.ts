export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};


export interface SignPayload { email: string; password: string; }
export const authApi = {
  signup: (payload: SignPayload) => api.post<{ id: string; email: string }>(`/auth/signup`, payload),
  signin: (payload: SignPayload) => api.post<{ id: string; email: string }>(`/auth/signin`, payload),
};

export type Platform = "email" | "telegram" | "whatsapp";
export interface CredentialDto {
  id: string;
  title: string;
  platform: Platform;
  data: Record<string, string>;
}

export const credentialsApi = {
  list: () => api.get<{ credentials: CredentialDto[] }>(`/credentials`),
  create: (payload: Omit<CredentialDto, "id">) => api.post(`/credentials`, payload),
  update: (id: string, payload: Partial<Omit<CredentialDto, "id">>) => api.put(`/credentials/${id}`, payload),
  remove: (id: string) => api.del(`/credentials/${id}`),
};


