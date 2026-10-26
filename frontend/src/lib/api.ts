const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
).replace(/\/+$/, '');

export async function fetchAPIResponse(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const isLoginRequest = cleanEndpoint.replace(/\/+$/, '').endsWith('/login');
  const headers = new Headers(options?.headers);

  headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined' && !isLoginRequest) {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined' && !isLoginRequest) {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    if (window.location.pathname !== '/login') {
      window.location.replace('/login');
    }
  }

  return response;
}

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetchAPIResponse(endpoint, options);
  const responseText = await response.text();
  let json: unknown = null;

  if (responseText) {
    try {
      json = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new Error('Terjadi kesalahan pada respon server backend.');
      }
    }
  }

  const payload = json && typeof json === 'object'
    ? json as Record<string, unknown>
    : {};

  if (!response.ok) {
    const errors = payload.errors && typeof payload.errors === 'object'
      ? Object.values(payload.errors).flat().filter((error): error is string => typeof error === 'string').join(', ')
      : '';
    const message = typeof payload.message === 'string'
      ? payload.message
      : errors || `Request gagal (${response.status}).`;
    throw new Error(message);
  }

  return (payload.data !== undefined ? payload.data : json) as T;
}
