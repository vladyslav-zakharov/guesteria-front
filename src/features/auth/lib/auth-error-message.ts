import { HTTP_STATUS } from 'shared/constants/http';
import { getApiError } from 'shared/lib/http/api-error';

const MESSAGES: Record<number, string> = {
  [HTTP_STATUS.unauthorized]: 'Invalid email or password',
  [HTTP_STATUS.conflict]: 'An account with this email already exists.',
  [HTTP_STATUS.tooManyRequests]: 'Too many attempts. Try again in a minute.',
};

const FALLBACK_MESSAGE = 'Something went wrong. Try again.';

export const getAuthErrorMessage = (error: unknown) => {
  const statusCode = getApiError(error)?.statusCode;

  return (statusCode && MESSAGES[statusCode]) ?? FALLBACK_MESSAGE;
};
