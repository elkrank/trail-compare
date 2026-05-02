import { clearAllTokens, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '../auth/token-storage';
import { fromHttpError, normalizeApiError } from './errors';
import { serializeQueryParams, type QueryParams } from './query';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string | undefined;

if (!BACKEND_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_BACKEND_BASE_URL is not set. API calls will fail until configured.');
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: QueryParams;
  headers?: Record<string, string>;
  retried?: boolean;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

let refreshPromise: Promise<string> | null = null;

function isAdminApiPath(path: string): boolean {
  return /\/api\/admin\//.test(path);
}

async function refreshAccessTokenShared(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available.');
    }

    const response = await fetch(`${BACKEND_BASE_URL ?? ''}/api/admin/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Refresh failed with status ${response.status}`);
    }

    const payload = (await response.json()) as RefreshResponse;
    setAccessToken(payload.accessToken);
    setRefreshToken(payload.refreshToken);
    return payload.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, query, headers = {}, retried = false } = options;

  const computedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (isAdminApiPath(path)) {
    const accessToken = getAccessToken();
    if (accessToken) {
      computedHeaders.Authorization = `Bearer ${accessToken}`;
    }
  }

  try {
    const response = await fetch(`${BACKEND_BASE_URL ?? ''}${path}${serializeQueryParams(query)}`, {
      method,
      headers: computedHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 401 && isAdminApiPath(path) && !retried && path !== '/api/admin/auth/refresh') {
      try {
        await refreshAccessTokenShared();
        return apiRequest<TResponse>(path, { ...options, retried: true });
      } catch {
        clearAllTokens();
      }
    }

    if (!response.ok) {
      let payload: unknown;
      try {
        payload = await response.json();
      } catch {
        payload = undefined;
      }

      const message =
        (payload as { message?: string } | undefined)?.message ??
        `Request failed with status ${response.status}`;

      throw fromHttpError(response.status, message, payload);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  } catch (error: unknown) {
    throw normalizeApiError(error);
  }
}
