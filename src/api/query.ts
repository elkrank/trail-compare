export type QueryPrimitive = string | number | boolean | Date | undefined | null;

export type QueryParams = Record<string, QueryPrimitive | QueryPrimitive[]>;

export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function serializeQueryParams(params: QueryParams = {}): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    const appendValue = (v: QueryPrimitive) => {
      if (v === undefined || v === null) return;
      if (v instanceof Date) {
        searchParams.append(key, formatDateYYYYMMDD(v));
        return;
      }
      searchParams.append(key, String(v));
    };

    if (Array.isArray(value)) {
      value.forEach(appendValue);
      return;
    }

    appendValue(value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
