import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRaces } from '../races.service';
import { AppApiError } from '../errors';

describe('races.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('list races with filters and pagination', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [], total: 0, page: 2, pageSize: 5 }),
    } as Response);

    const result = await getRaces({ region: 'alps', minDistance: 20, page: 2, size: 5 });

    expect(result.page).toBe(2);
    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/api/races?');
    expect(String(url)).toContain('region=alps');
    expect(String(url)).toContain('minDistance=20');
    expect(String(url)).toContain('page=2');
    expect(String(url)).toContain('size=5');
  });

  it.each([401, 404, 500])('returns mapped error on HTTP %s', async (status) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status,
      json: async () => ({ message: 'failed' }),
    } as Response);

    await expect(getRaces()).rejects.toBeInstanceOf(AppApiError);
  });
});
