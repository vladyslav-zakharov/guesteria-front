export const HTTP_STATUS = {
  badRequest: 400,
  unauthorized: 401,
  notFound: 404,
  conflict: 409,
  tooManyRequests: 429,
  serviceUnavailable: 503,
  gatewayTimeout: 504,
} as const;
