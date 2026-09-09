const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || 'Terjadi kesalahan pada request.');
  }

  return json.data;
}