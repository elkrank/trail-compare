import { apiRequest } from './client';
import type {
  AdminLoginRequest,
  AdminRefreshRequest,
  AdminTokenResponse,
} from './types';

export function adminLogin(
  payload: AdminLoginRequest,
): Promise<AdminTokenResponse> {
  return apiRequest<AdminTokenResponse>('/api/admin/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function adminRefresh(
  payload: AdminRefreshRequest,
): Promise<AdminTokenResponse> {
  return apiRequest<AdminTokenResponse>('/api/admin/auth/refresh', {
    method: 'POST',
    body: payload,
  });
}
