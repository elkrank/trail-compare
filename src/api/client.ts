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
  accessToken?: string;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = 'GET', body, query, headers = {}, accessToken } = options;

  try {
    const response = await fetch(`${BACKEND_BASE_URL ?? ''}${path}${serializeQueryParams(query)}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

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
