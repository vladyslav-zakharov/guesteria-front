import * as z from 'zod';

// A missing or malformed `?page=` falls back to the first page instead of failing the request.
export const todosSearchParamsSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
});
