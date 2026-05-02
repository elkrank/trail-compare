export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  status?: number;
  message: string;
  details?: unknown;
}

const HTTP_STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE',
};

export class AppApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'AppApiError';
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }
}

export function normalizeApiError(input: unknown): AppApiError {
  if (input instanceof AppApiError) {
    return input;
  }

  if (input instanceof Error) {
    return new AppApiError({
      code: 'NETWORK_ERROR',
      message: input.message || 'Network request failed',
      details: input,
    });
  }

  return new AppApiError({
    code: 'UNKNOWN_ERROR',
    message: 'An unknown API error occurred',
    details: input,
  });
}

export function fromHttpError(
  status: number,
  message: string,
  details?: unknown,
): AppApiError {
  const code =
    HTTP_STATUS_TO_CODE[status] ??
    (status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR');

  return new AppApiError({
    code,
    status,
    message,
    details,
  });
}
