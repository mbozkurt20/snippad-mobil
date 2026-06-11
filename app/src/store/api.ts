import { storage } from './storage';

// Production: https://backend.snippad.tech/api/v1
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://backend.snippad.tech/api/v1';

// 401 callback — useAppStore bunu set eder (circular import önlemek için)
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(cb: () => void) { onUnauthorized = cb; }

const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'ngrok-skip-browser-warning': 'true',
};

function getToken(): string | undefined {
  try { return storage.getString('api_token'); } catch { return undefined; }
}

export function setApiToken(token: string) {
  storage.set('api_token', token);
}

export function clearApiToken() {
  storage.remove('api_token');
}

export function hasToken(): boolean {
  return !!getToken();
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = { ...BASE_HEADERS };

  // FormData ise Content-Type'ı remove et (browser otomatik multipart/form-data set eder)
  if (options.body instanceof FormData) {
    console.log('[apiFetch] FormData detected, removing Content-Type');
    delete headers['Content-Type'];
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);

  console.log('[apiFetch]', path, 'method:', options.method, 'finalHeaders:', Object.keys(headers));
  return fetch(`${API_BASE}${path}`, { ...options, headers });
}

export async function apiJson<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await apiFetch(path, options);
    let json: any;
    try {
      json = await res.json();
    } catch (e) {
      console.error(`[API JSON PARSE ERROR] ${path}:`, e);
      throw new Error(`Failed to parse response: ${res.statusText}`);
    }
    if (!res.ok) {
      if (res.status === 401) {
        clearApiToken();
        onUnauthorized?.();
      }
      console.error(`[API ERROR RESPONSE] ${path} HTTP ${res.status}:`, json);
      const msg = json?.message ?? `HTTP ${res.status}`;
      throw Object.assign(new Error(msg), {
        status: res.status,
        data: json,
        errors: json?.errors
      });
    }
    return json as T;
  } catch (err) {
    console.error(`[API ERROR] ${path}:`, err instanceof Error ? err.message : err);
    throw err;
  }
}

export const api = {
  get:    <T>(path: string)                    => apiJson<T>(path),
  post:   <T>(path: string, body: unknown)     => {
    // FormData kontrolü — instanceof yeterli
    const isFormData = body instanceof FormData;

    console.log(`[API POST] ${path} isFormData:`, isFormData, 'bodyType:', typeof body);

    if (isFormData) {
      console.log('[FormData] Passing raw FormData without JSON.stringify');
      const token = getToken();
      const headers: Record<string, string> = { 'Accept': 'application/json', 'ngrok-skip-browser-warning': 'true' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return apiJson<T>(path, { method: 'POST', body: body as any, headers });
    }

    console.log('[JSON POST] Stringifying body');
    return apiJson<T>(path, { method: 'POST', body: JSON.stringify(body) });
  },
  put:    <T>(path: string, body: unknown)     => apiJson<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)     => apiJson<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)                   => apiJson<T>(path, { method: 'DELETE' }),
};
