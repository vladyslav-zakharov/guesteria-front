import * as z from 'zod';

const NAME_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 254;

export const SPECIAL_REQUESTS_MAX_LENGTH = 500;

// Same rule as the booking request (spec §API): digits, spaces, brackets and dashes,
// with an optional leading +.
const PHONE_PATTERN = /^\+?[0-9 ()-]{7,20}$/;

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label}.`)
    .max(NAME_MAX_LENGTH, `Use up to ${NAME_MAX_LENGTH} characters.`);

export const guestFormSchema = z.object({
  firstName: nameSchema('first name'),
  lastName: nameSchema('last name'),
  // The booking request caps the email at 254, so a longer one would pass the prebook
  // and then fail the book.
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX_LENGTH, `Use up to ${EMAIL_MAX_LENGTH} characters.`)
    .pipe(z.email('Enter a valid email address.')),
  phone: z
    .string()
    .trim()
    .regex(
      PHONE_PATTERN,
      'Enter a phone number, for example +44 20 7946 0958.',
    ),
  specialRequests: z
    .string()
    .trim()
    .max(
      SPECIAL_REQUESTS_MAX_LENGTH,
      `Use up to ${SPECIAL_REQUESTS_MAX_LENGTH} characters.`,
    ),
});

export type GuestDetails = z.infer<typeof guestFormSchema>;
