import * as z from 'zod';

export const MESSAGE_MAX_LENGTH = 1000;

// Mirrors the `content` rule of POST /bookings/:bookingId/messages, so a blank or
// oversized question never leaves the browser.
export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Type a question.')
    .max(
      MESSAGE_MAX_LENGTH,
      `Keep your question under ${MESSAGE_MAX_LENGTH} characters.`,
    ),
});
