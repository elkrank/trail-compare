import { describe, expect, it } from 'vitest';
import { formatDateYYYYMMDD, serializeQueryParams } from '../query';

describe('query helpers', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date(Date.UTC(2026, 4, 2));
    expect(formatDateYYYYMMDD(date)).toBe('2026-05-02');
  });

  it('serializes Date query fields as YYYY-MM-DD', () => {
    const query = serializeQueryParams({
      minDate: new Date(Date.UTC(2026, 0, 5)),
      maxDate: new Date(Date.UTC(2026, 11, 31)),
    });

    expect(query).toContain('minDate=2026-01-05');
    expect(query).toContain('maxDate=2026-12-31');
  });
});
