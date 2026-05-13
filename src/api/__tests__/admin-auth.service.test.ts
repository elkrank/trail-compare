import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminLogin, adminRefresh, loginAdmin } from '../admin-auth.service';
import { AppApiError } from '../errors';

describe('admin-auth.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('login success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'a1', refreshToken: 'r1', tokenType: 'Bearer' }),
    } as Response);

    const result = await loginAdmin('admin', 'pwd');

    expect(result.accessToken).toBe('a1');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'pwd' }),
      }),
    );
  });

  it('keeps adminLogin as a backward-compatible wrapper', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'a1', refreshToken: 'r1', tokenType: 'Bearer' }),
    } as Response);

    const result = await adminLogin({ username: 'admin', password: 'pwd' });

    expect(result.accessToken).toBe('a1');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'pwd' }),
      }),
    );
  });

  it('refresh success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'a2', refreshToken: 'r2', tokenType: 'Bearer' }),
    } as Response);

    const result = await adminRefresh({ refreshToken: 'r1' });
    expect(result.refreshToken).toBe('r2');
  });

  it.each<[number, string]>([
    [400, 'Veuillez remplir tous les champs.'],
    [401, 'Identifiants invalides.'],
    [429, 'Trop de tentatives de connexion. Réessayez dans une minute.'],
    [500, 'Impossible de se connecter pour le moment. Réessayez plus tard.'],
  ])('maps login HTTP %s errors to expected user messages', async (status, message) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status,
      json: async () => ({ message: 'boom' }),
    } as Response);

    await expect(loginAdmin('x', 'y')).rejects.toMatchObject({
      status,
      userMessage: message,
      technicalMessage: 'boom',
    });
  });

  it('maps refresh HTTP errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'boom' }),
    } as Response);

    await expect(adminRefresh({ refreshToken: 'r1' })).rejects.toBeInstanceOf(AppApiError);
  });
});
