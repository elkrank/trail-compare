const ACCESS_TOKEN_KEY = 'admin_access_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';
const TOKEN_TYPE_KEY = 'admin_token_type';

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;
let inMemoryTokenType: string | null = null;

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

export function getTokenType(): string | null {
  const storage = getStorage();
  if (!storage) {
    return inMemoryTokenType;
  }

  return storage.getItem(TOKEN_TYPE_KEY);
}

export function setTokenType(tokenType: string): void {
  const storage = getStorage();
  if (!storage) {
    inMemoryTokenType = tokenType;
    return;
  }

  storage.setItem(TOKEN_TYPE_KEY, tokenType);
}

export function clearAllTokens(): void {
  const storage = getStorage();
  if (!storage) {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    inMemoryTokenType = null;
    return;
  }

  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
  storage.removeItem(TOKEN_TYPE_KEY);
}
