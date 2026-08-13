import { env } from '../config/env';

export interface ApiResponse<T> {
  data?: T;
  error?: {
    statusCode: number;
    message: string | string[];
    error: string;
  };
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${env.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string>),
      },
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({
        statusCode: res.status,
        message: res.statusText,
        error: 'HTTP Error',
      }));
      return { error: errorJson };
    }

    const data = await res.json().catch(() => ({} as T));
    return { data };
  } catch (err) {
    return {
      error: {
        statusCode: 500,
        message: err instanceof Error ? err.message : 'Network error',
        error: 'Network Error',
      },
    };
  }
}
