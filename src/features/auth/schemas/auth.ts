import * as z from 'zod';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;
const NAME_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 254;

const emailSchema = z
  .string()
  .trim()
  .max(EMAIL_MAX_LENGTH, `Use up to ${EMAIL_MAX_LENGTH} characters.`)
  .pipe(z.email('Enter a valid email address.'));

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${label}.`)
    .max(NAME_MAX_LENGTH, `Use up to ${NAME_MAX_LENGTH} characters.`);

// Mirrors the back-end auth rules (spec §API): 8 to 72 characters is the spec's password
// rule, so a password the front accepts is never rejected by the API.
export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Enter your password.')
    .max(PASSWORD_MAX_LENGTH, `Use up to ${PASSWORD_MAX_LENGTH} characters.`),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
    .max(PASSWORD_MAX_LENGTH, `Use up to ${PASSWORD_MAX_LENGTH} characters.`),
  firstName: nameSchema('first name'),
  lastName: nameSchema('last name'),
});
