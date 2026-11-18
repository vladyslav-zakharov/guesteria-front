import { HTTP_STATUS } from 'shared/constants/http';
import { getApiError } from 'shared/lib/http/api-error';

export type ChatErrorKind =
  | 'dailyLimit'
  | 'rateLimited'
  | 'unavailable'
  | 'timeout'
  | 'notFound'
  | 'unauthorized'
  | 'failed';

export type ChatError = {
  kind: ChatErrorKind;
  message: string;
};

// The per-user daily cap and the per-minute rate limit are both 429; only the code tells
// a guest whether waiting a minute helps.
const DAILY_LIMIT_CODE = 'DAILY_LIMIT_REACHED';

export const DAILY_LIMIT_MESSAGE = 'Daily limit reached';

export const TRIP_NOT_FOUND_MESSAGE = 'Trip not found';

const CHAT_ERRORS: Record<ChatErrorKind, string> = {
  dailyLimit: DAILY_LIMIT_MESSAGE,
  rateLimited: 'Too many messages. Wait a minute and try again.',
  unavailable: 'The concierge is unavailable right now.',
  timeout: 'The concierge took too long. Try again.',
  notFound: TRIP_NOT_FOUND_MESSAGE,
  unauthorized: 'Your session has ended. Sign in to continue.',
  failed: 'The concierge could not answer. Try again.',
};

const toKind = (error: unknown): ChatErrorKind => {
  const apiError = getApiError(error);

  switch (apiError?.statusCode) {
    case HTTP_STATUS.tooManyRequests:
      return apiError.code === DAILY_LIMIT_CODE ? 'dailyLimit' : 'rateLimited';

    case HTTP_STATUS.serviceUnavailable:
      return 'unavailable';

    case HTTP_STATUS.gatewayTimeout:
      return 'timeout';

    case HTTP_STATUS.notFound:
      return 'notFound';

    case HTTP_STATUS.unauthorized:
      return 'unauthorized';

    default:
      // 502, 500 and network failures: the model or the connection failed, and the same
      // question usually works when sent again.
      return 'failed';
  }
};

export const getChatError = (error: unknown): ChatError => {
  const kind = toKind(error);

  return { kind, message: CHAT_ERRORS[kind] };
};
