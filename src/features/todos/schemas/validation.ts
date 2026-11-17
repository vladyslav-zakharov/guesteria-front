import * as z from 'zod';

export const createTodoSchema = z.object({
  title: z.string().trim().min(1, { error: 'Title is required' }),
  completed: z.boolean().default(false),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
