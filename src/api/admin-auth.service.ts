import { apiRequest } from './client';
import type {
  AdminLoginRequestDto,
  AdminLoginResponseDto,
  AdminRefreshRequestDto,
  AdminRefreshResponseDto,
} from './types';

export function adminLogin(
  payload: AdminLoginRequestDto,
): Promise<AdminLoginResponseDto> {
  return apiRequest<AdminLoginResponseDto>('/api/admin/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function adminRefresh(
  payload: AdminRefreshRequestDto,
): Promise<AdminRefreshResponseDto> {
  return apiRequest<AdminRefreshResponseDto>('/api/admin/auth/refresh', {
    method: 'POST',
    body: payload,
  });
}
