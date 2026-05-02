const ACCESS_TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

function getStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export function getAccessToken(): string | null {
  const storage = getStorage();
  if (!storage) {
    return inMemoryAccessToken;
  }

  return storage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  const storage = getStorage();
  if (!storage) {
    inMemoryAccessToken = token;
    return;
  }

  storage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  const storage = getStorage();
  if (!storage) {
    inMemoryAccessToken = null;
    return;
  }

  storage.removeItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  const storage = getStorage();
  if (!storage) {
    return inMemoryRefreshToken;
  }

  return storage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  const storage = getStorage();
  if (!storage) {
    inMemoryRefreshToken = token;
    return;
  }

  storage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearAllTokens(): void {
  const storage = getStorage();
  if (!storage) {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    return;
  }

  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}
