import * as z from 'zod';

import {
  firstValue,
  type SearchParamsRecord,
} from 'shared/lib/stay/stay-params';

// Booking ids are our UUIDs, so anything else in the URL cannot open a trip and is
// dropped before it reaches the API.
const bookingParamSchema = z.uuid();

export const parseBookingParam = (raw: SearchParamsRecord): string | null => {
  const result = bookingParamSchema.safeParse(firstValue(raw.booking));

  return result.success ? result.data : null;
};
