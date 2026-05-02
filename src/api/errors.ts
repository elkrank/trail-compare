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
  userMessage: string;
  technicalMessage: string;
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
    super(error.userMessage);
    this.name = 'AppApiError';
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
    this.userMessage = error.userMessage;
    this.technicalMessage = error.technicalMessage;
  }

  readonly userMessage: string;
  readonly technicalMessage: string;
}

function buildUserMessage(code: ApiErrorCode, status?: number): string {
  if (code === 'UNAUTHORIZED') {
    return 'Session expirée ou accès non autorisé. Merci de vous reconnecter.';
  }

  if (code === 'NOT_FOUND' || status === 404) {
    return 'La ressource demandée est introuvable.';
  }

  if (code === 'NETWORK_ERROR') {
    return 'Erreur réseau. Vérifiez votre connexion puis réessayez.';
  }

  return 'Une erreur est survenue. Merci de réessayer.';
}

export function normalizeApiError(input: unknown): AppApiError {
  if (input instanceof AppApiError) {
    return input;
  }

  if (input instanceof Error) {
    return new AppApiError({
      code: 'NETWORK_ERROR',
      userMessage: buildUserMessage('NETWORK_ERROR'),
      technicalMessage: input.message || 'Network request failed',
      details: input,
    });
  }

  return new AppApiError({
    code: 'UNKNOWN_ERROR',
    userMessage: buildUserMessage('UNKNOWN_ERROR'),
    technicalMessage: 'An unknown API error occurred',
    details: input,
  });
}

export function fromHttpError(
  status: number,
  technicalMessage: string,
  details?: unknown,
): AppApiError {
  const code =
    HTTP_STATUS_TO_CODE[status] ??
    (status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR');

  return new AppApiError({
    code,
    status,
    userMessage: buildUserMessage(code, status),
    technicalMessage,
    details,
  });
}
