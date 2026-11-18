import * as z from 'zod';

import {
  CHILDREN_SEPARATOR,
  PLACE_ID_MAX_LENGTH,
  STAY_LIMITS,
} from 'shared/constants/stay';
import { countNights } from 'shared/lib/format/format';

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

const INTEGER_PATTERN = /^\d+$/;

const stayFieldsSchema = z.object({
  placeId: z
    .string()
    .trim()
    .min(1, 'Choose a destination.')
    .max(PLACE_ID_MAX_LENGTH, 'Choose a destination.'),
  placeName: z.string().trim().min(1, 'Choose a destination.'),
  checkin: z.iso.date('Choose a check-in date.'),
  checkout: z.iso.date('Choose a check-out date.'),
  adults: z
    .number()
    .int()
    .min(STAY_LIMITS.minAdults, `At least ${STAY_LIMITS.minAdults} adult.`)
    .max(STAY_LIMITS.maxAdults, `Up to ${STAY_LIMITS.maxAdults} adults.`),
  children: z
    .array(
      z
        .number()
        .int()
        .min(0)
        .max(
          STAY_LIMITS.maxChildAge,
          `Children are aged 0 to ${STAY_LIMITS.maxChildAge}.`,
        ),
    )
    .max(STAY_LIMITS.maxChildren, `Up to ${STAY_LIMITS.maxChildren} children.`),
});

export type StayParams = z.infer<typeof stayFieldsSchema>;

type StayField = keyof StayParams;

const STAY_FIELDS = Object.keys(stayFieldsSchema.shape) as StayField[];

type StayDates = Pick<StayParams, 'checkin' | 'checkout'>;

const checkStayDates =
  (today: string) =>
  <T extends StayDates>({ checkin, checkout }: T, ctx: z.RefinementCtx<T>) => {
    const nights = countNights({ checkin, checkout });
    const daysAhead = countNights({ checkin: today, checkout: checkin });

    if (nights < 1) {
      ctx.addIssue({
        code: 'custom',
        path: ['checkout'],
        message: 'Check-out must be after check-in.',
      });
    }

    if (nights > STAY_LIMITS.maxNights) {
      ctx.addIssue({
        code: 'custom',
        path: ['checkout'],
        message: `Stays can be up to ${STAY_LIMITS.maxNights} nights.`,
      });
    }

    if (daysAhead < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['checkin'],
        message: 'Check-in cannot be in the past.',
      });
    }

    if (daysAhead > STAY_LIMITS.maxAdvanceDays) {
      ctx.addIssue({
        code: 'custom',
        path: ['checkin'],
        message: `Check-in must be within ${STAY_LIMITS.maxAdvanceDays} days.`,
      });
    }
  };

export const buildStaySchema = (today: string) =>
  stayFieldsSchema.superRefine(checkStayDates(today));

// The hotel and booking pages key their queries on the stay alone, without the place the
// search started from.
const hotelStayFieldsSchema = stayFieldsSchema.pick({
  checkin: true,
  checkout: true,
  adults: true,
  children: true,
});

export type HotelStay = z.infer<typeof hotelStayFieldsSchema>;

const buildHotelStaySchema = (today: string) =>
  hotelStayFieldsSchema.superRefine(checkStayDates(today));

// Next hands a repeated query key over as an array; only its first value counts.
export const firstValue = <T>(value: T | T[]): T | undefined =>
  Array.isArray(value) ? value[0] : value;

// A non-numeric string stays a string, so Zod rejects it as the wrong type instead of
// Number() quietly turning '' into 0 or '1e1' into 10.
const toInteger = (value: string) =>
  INTEGER_PATTERN.test(value) ? Number(value) : value;

const toChildren = (value: string | undefined) =>
  value ? value.split(CHILDREN_SEPARATOR).map(toInteger) : [];

const coerceStayParams = (
  raw: SearchParamsRecord,
): Record<StayField, unknown> => {
  const adults = firstValue(raw.adults);

  return {
    placeId: firstValue(raw.placeId),
    placeName: firstValue(raw.placeName),
    checkin: firstValue(raw.checkin),
    checkout: firstValue(raw.checkout),
    adults: adults === undefined ? undefined : toInteger(adults),
    children: toChildren(firstValue(raw.children)),
  };
};

export const parseStayParams = ({
  raw,
  today,
}: {
  raw: SearchParamsRecord;
  today: string;
}): StayParams | null => {
  const result = buildStaySchema(today).safeParse(coerceStayParams(raw));

  return result.success ? result.data : null;
};

export const parseHotelStayParams = ({
  raw,
  today,
}: {
  raw: SearchParamsRecord;
  today: string;
}): HotelStay | null => {
  const result = buildHotelStaySchema(today).safeParse(coerceStayParams(raw));

  return result.success ? result.data : null;
};

export const parseStayPrefill = (
  raw: SearchParamsRecord,
): Partial<StayParams> => {
  const coerced = coerceStayParams(raw);
  const entries = STAY_FIELDS.flatMap(field => {
    const result = stayFieldsSchema.shape[field].safeParse(coerced[field]);

    return result.success ? [[field, result.data] as const] : [];
  });

  return Object.fromEntries(entries);
};

export const serializeStayParams = ({
  placeId,
  placeName,
  checkin,
  checkout,
  adults,
  children,
}: StayParams) =>
  new URLSearchParams({
    placeId,
    placeName,
    checkin,
    checkout,
    adults: String(adults),
    children: children.join(CHILDREN_SEPARATOR),
  }).toString();

export const serializeHotelStayParams = ({
  checkin,
  checkout,
  adults,
  children,
}: HotelStay) =>
  new URLSearchParams({
    checkin,
    checkout,
    adults: String(adults),
    children: children.join(CHILDREN_SEPARATOR),
  }).toString();
