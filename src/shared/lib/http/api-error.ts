import { isAxiosError } from 'axios';
import * as z from 'zod';

const apiErrorSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  error: z.string(),
  message: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

const UNKNOWN_ERROR_CODE = 'UNKNOWN';

export const getApiError = (error: unknown): ApiError | null => {
  if (!isAxiosError(error) || !error.response) {
    return null;
  }

  const { status, statusText } = error.response;
  const result = apiErrorSchema.safeParse(error.response.data);

  if (result.success) {
    return result.data;
  }

  // A proxy or platform error (a Vercel 504, for example) has no API body, but its status
  // still decides which message the user sees.
  return {
    statusCode: status,
    code: UNKNOWN_ERROR_CODE,
    error: statusText,
    message: statusText,
  };
};
