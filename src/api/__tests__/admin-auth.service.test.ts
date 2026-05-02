import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminLogin, adminRefresh } from '../admin-auth.service';
import { AppApiError } from '../errors';

describe('admin-auth.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('login success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'a1', refreshToken: 'r1', tokenType: 'Bearer', expiresIn: 3600 }),
    } as Response);

    const result = await adminLogin({ username: 'admin', password: 'pwd' });

    expect(result.accessToken).toBe('a1');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/auth/login'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('refresh success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ accessToken: 'a2', refreshToken: 'r2', tokenType: 'Bearer', expiresIn: 3600 }),
    } as Response);

    const result = await adminRefresh({ refreshToken: 'r1' });
    expect(result.refreshToken).toBe('r2');
  });

  it.each([401, 404, 500])('maps HTTP %s errors', async (status) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status,
      json: async () => ({ message: 'boom' }),
    } as Response);

    await expect(adminLogin({ username: 'x', password: 'y' })).rejects.toBeInstanceOf(AppApiError);
  });
});
