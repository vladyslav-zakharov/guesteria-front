import { HTTP_STATUS } from 'shared/constants/http';
import { getApiError } from 'shared/lib/http/api-error';

export type CheckoutStage = 'prebook' | 'book';

export type CheckoutFailure = {
  title: string;
  message: string;
  canRetry: boolean;
  checkTrips: boolean;
};

const SERVER_ERROR = 500;

const failure = (
  title: string,
  message: string,
  options: Partial<Pick<CheckoutFailure, 'canRetry' | 'checkTrips'>> = {},
): CheckoutFailure => ({
  title,
  message,
  canRetry: options.canRetry ?? false,
  checkTrips: options.checkTrips ?? false,
});

export const isSessionExpired = (error: unknown) =>
  getApiError(error)?.statusCode === HTTP_STATUS.unauthorized;

// A book that failed upstream, timed out or lost its connection may still have reached
// the hotel, so it is never retried blindly: the guest checks Trips first.
const isBookOutcomeUnknown = (statusCode: number | undefined) =>
  statusCode === undefined || statusCode >= SERVER_ERROR;

export const getCheckoutFailure = ({
  stage,
  error,
}: {
  stage: CheckoutStage;
  error: unknown;
}): CheckoutFailure => {
  const statusCode = getApiError(error)?.statusCode;

  if (statusCode === HTTP_STATUS.unauthorized) {
    return failure(
      'Sign in to continue',
      'Your session has ended. Sign in, then try again.',
      { canRetry: true },
    );
  }

  if (statusCode === HTTP_STATUS.conflict) {
    return failure('Room not available', 'This room is no longer available.');
  }

  if (statusCode === HTTP_STATUS.tooManyRequests) {
    return failure(
      'Too many attempts',
      'Too many attempts. Wait a minute and try again.',
      { canRetry: true },
    );
  }

  // The offer no longer matches this stay (the hotel repriced it for other dates or
  // guests), so sending the same offer again cannot succeed.
  if (stage === 'prebook' && statusCode === HTTP_STATUS.badRequest) {
    return failure(
      'This offer changed',
      'This offer changed. Go back to the hotel and pick it again.',
    );
  }

  if (stage === 'prebook' && statusCode === HTTP_STATUS.gatewayTimeout) {
    return failure(
      'Price check timed out',
      'Confirming the price took too long. Try again.',
      { canRetry: true },
    );
  }

  if (stage === 'book' && isBookOutcomeUnknown(statusCode)) {
    return failure(
      "We couldn't confirm your booking",
      'It may still go through. Wait a few minutes, then check Trips before you try again.',
      { checkTrips: true },
    );
  }

  return failure(
    'Booking not completed',
    'Something went wrong. You have not been charged.',
    { canRetry: true },
  );
};
