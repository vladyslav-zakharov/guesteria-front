import { HTTP_STATUS } from 'shared/constants/http';
import { getApiError } from 'shared/lib/http/api-error';

export type HotelError = {
  message: string;
  canRetry: boolean;
};

const MESSAGES: Record<number, string> = {
  [HTTP_STATUS.tooManyRequests]:
    'Too many requests in a short time. Wait a minute and try again.',
  [HTTP_STATUS.gatewayTimeout]:
    'Checking prices took too long. Try again in a moment.',
};

// The API rejected the stay itself (a check-in that turned into yesterday at midnight
// UTC, for example), so retrying the same request cannot help; the guest changes it.
const INVALID_STAY_MESSAGE =
  'These dates are no longer valid. Change them and try again.';

// 502 and network failures land here: the hotel provider or the connection failed, and
// the same request usually works on retry.
const FALLBACK_MESSAGE =
  'Our hotel partner did not respond. Try again in a moment.';

export const isHotelNotFound = (error: unknown) =>
  getApiError(error)?.statusCode === HTTP_STATUS.notFound;

export const getHotelError = (error: unknown): HotelError => {
  const statusCode = getApiError(error)?.statusCode;

  if (statusCode === HTTP_STATUS.badRequest) {
    return { message: INVALID_STAY_MESSAGE, canRetry: false };
  }

  return {
    message:
      (statusCode ? MESSAGES[statusCode] : undefined) ?? FALLBACK_MESSAGE,
    canRetry: true,
  };
};
