import { HTTP_STATUS } from 'shared/constants/http';
import { getApiError } from 'shared/lib/http/api-error';

export type ResultsError = {
  message: string;
  canRetry: boolean;
};

const MESSAGES: Record<number, string> = {
  [HTTP_STATUS.tooManyRequests]:
    'Too many searches in a short time. Wait a minute and try again.',
  [HTTP_STATUS.gatewayTimeout]:
    'The search took too long. Try again in a moment.',
};

// The API rejected the search itself (a check-in that turned into yesterday at midnight
// UTC, for example), so retrying the same request cannot help; the guest changes it.
const INVALID_SEARCH_MESSAGE =
  'This search is no longer valid. Change it and try again.';

// 502 and network failures land here: the hotel provider or the connection failed, and
// the same search usually works on retry.
const FALLBACK_MESSAGE =
  'Our hotel partner did not respond. Try again in a moment.';

export const getResultsError = (error: unknown): ResultsError => {
  const statusCode = getApiError(error)?.statusCode;

  if (statusCode === HTTP_STATUS.badRequest) {
    return { message: INVALID_SEARCH_MESSAGE, canRetry: false };
  }

  return {
    message:
      (statusCode ? MESSAGES[statusCode] : undefined) ?? FALLBACK_MESSAGE,
    canRetry: true,
  };
};
