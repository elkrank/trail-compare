import type {
  AdminLoginRequestDto,
  AdminLoginResponseDto,
  AdminRefreshResponseDto,
} from '../api/types';
import {
  clearAllTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './token-storage';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL as string | undefined;

export interface AdminSessionState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
}

type SessionListener = (state: AdminSessionState) => void;

const listeners = new Set<SessionListener>();

function getState(): AdminSessionState {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  return {
    isAuthenticated: Boolean(accessToken && refreshToken),
    accessToken,
    refreshToken,
  };
}

function notifySessionChange(): void {
  const state = getState();
  listeners.forEach((listener) => listener(state));
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${BACKEND_BASE_URL ?? ''}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getAdminSessionState(): AdminSessionState {
  return getState();
}

export function subscribeToAdminSession(listener: SessionListener): () => void {
  listeners.add(listener);
  listener(getState());

  return () => {
    listeners.delete(listener);
  };
}

function persistTokens(accessToken: string, refreshToken: string): void {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
  notifySessionChange();
}

export async function loginAdmin(payload: AdminLoginRequestDto): Promise<AdminLoginResponseDto> {
  const response = await postJson<AdminLoginResponseDto>('/api/admin/auth/login', payload);
  persistTokens(response.accessToken, response.refreshToken);
  return response;
}

export async function refreshAdminSession(): Promise<AdminRefreshResponseDto> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available.');
  }

  const response = await postJson<AdminRefreshResponseDto>('/api/admin/auth/refresh', { refreshToken });
  persistTokens(response.accessToken, response.refreshToken);
  return response;
}

export function logoutAdmin(): void {
  clearAllTokens();
  notifySessionChange();
}
