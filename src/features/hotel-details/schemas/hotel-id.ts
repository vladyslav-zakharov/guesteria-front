import * as z from 'zod';

import { HOTEL_ID_PATTERN } from 'shared/constants/stay';

// A malformed path is a 404 page instead of a request the API rejects with 400.

const hotelIdSchema = z.string().regex(HOTEL_ID_PATTERN);

export const isValidHotelId = (hotelId: string) =>
  hotelIdSchema.safeParse(hotelId).success;
