const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getTokens(): TokenPair | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('auth_tokens');
    return stored ? JSON.parse(stored) : null;
  }

  private setTokens(tokens: TokenPair) {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  clearTokens() {
    localStorage.removeItem('auth_tokens');
  }

  private async request<T>(path: string, options: RequestInit = {}, isFormData = false): Promise<T> {
    const tokens = this.getTokens();
    const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }

    let res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });

    if (res.status === 401 && tokens?.refreshToken) {
      const refreshed = await this.refresh(tokens.refreshToken);
      if (refreshed) {
        headers['Authorization'] = `Bearer ${refreshed.accessToken}`;
        res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  postForm<T>(path: string, body: FormData) {
    return this.request<T>(path, { method: 'POST', body }, true);
  }

  private async refresh(refreshToken: string): Promise<TokenPair | null> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        this.clearTokens();
        return null;
      }

      const data = await res.json();
      this.setTokens(data.tokens);
      return data.tokens;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE);

export async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(error.message);
  }

  const data = await res.json();
  localStorage.setItem('auth_tokens', JSON.stringify(data.tokens));
  return data;
}

export async function registerApi(email: string, password: string, fullName: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(error.message);
  }

  const data = await res.json();
  localStorage.setItem('auth_tokens', JSON.stringify(data.tokens));
  return data;
}

export async function logoutApi() {
  const tokens = localStorage.getItem('auth_tokens');
  if (tokens) {
    const { refreshToken } = JSON.parse(tokens);
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {}
  }
  localStorage.removeItem('auth_tokens');
}
