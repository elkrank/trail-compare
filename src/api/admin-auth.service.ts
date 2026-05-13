import { apiRequest } from './client';
import { AppApiError, fromHttpError, normalizeApiError } from './errors';
import type {
  AdminLoginRequest,
  AdminRefreshRequest,
  AdminTokenResponse,
  ApiErrorResponse,
} from './types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string | undefined;
const LOGIN_ERROR_MESSAGES: Record<number, string> = {
  400: 'Veuillez remplir tous les champs.',
  401: 'Identifiants invalides.',
  429: 'Trop de tentatives de connexion. Réessayez dans une minute.',
};
const FALLBACK_LOGIN_ERROR_MESSAGE = 'Impossible de se connecter pour le moment. Réessayez plus tard.';

async function readApiErrorResponse(response: Response): Promise<ApiErrorResponse | undefined> {
  try {
    return (await response.json()) as ApiErrorResponse;
  } catch {
    return undefined;
  }
}

function buildLoginError(status: number, payload?: ApiErrorResponse): AppApiError {
  const apiError = fromHttpError(
    status,
    payload?.message ?? `Request failed with status ${status}`,
    payload,
  );

  return new AppApiError({
    code: apiError.code,
    status: apiError.status,
    userMessage: LOGIN_ERROR_MESSAGES[status] ?? FALLBACK_LOGIN_ERROR_MESSAGE,
    technicalMessage: apiError.technicalMessage,
    details: apiError.details,
  });
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<AdminTokenResponse> {
  try {
    const response = await fetch(`${API_BASE_URL ?? ''}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const payload = await readApiErrorResponse(response);
      throw buildLoginError(response.status, payload);
    }

    return (await response.json()) as AdminTokenResponse;
  } catch (error: unknown) {
    if (error instanceof AppApiError) {
      throw error;
    }

    const normalizedError = normalizeApiError(error);
    throw new AppApiError({
      code: normalizedError.code,
      status: normalizedError.status,
      userMessage: FALLBACK_LOGIN_ERROR_MESSAGE,
      technicalMessage: normalizedError.technicalMessage,
      details: normalizedError.details,
    });
  }
}

export function adminLogin(
  payload: AdminLoginRequest,
): Promise<AdminTokenResponse> {
  return loginAdmin(payload.username, payload.password);
}

export function adminRefresh(
  payload: AdminRefreshRequest,
): Promise<AdminTokenResponse> {
  return apiRequest<AdminTokenResponse>('/api/admin/auth/refresh', {
    method: 'POST',
    body: payload,
  });
}
