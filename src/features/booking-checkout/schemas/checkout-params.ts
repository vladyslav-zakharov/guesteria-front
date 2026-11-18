import * as z from 'zod';

import { HOTEL_ID_PATTERN } from 'shared/constants/stay';
import {
  firstValue,
  parseHotelStayParams,
  type HotelStay,
  type SearchParamsRecord,
} from 'shared/lib/stay/stay-params';

const OFFER_ID_MAX_LENGTH = 2000;

// Mirrors the prebook request rules (spec §API), so a hand-edited URL goes home instead
// of failing at submit.
const checkoutRouteSchema = z.object({
  hotelId: z.string().regex(HOTEL_ID_PATTERN),
  offerId: z.string().min(1).max(OFFER_ID_MAX_LENGTH),
});

export type CheckoutParams = z.infer<typeof checkoutRouteSchema> & {
  stay: HotelStay;
};

export const parseCheckoutParams = ({
  hotelId,
  raw,
  today,
}: {
  hotelId: string;
  raw: SearchParamsRecord;
  today: string;
}): CheckoutParams | null => {
  const route = checkoutRouteSchema.safeParse({
    hotelId,
    offerId: firstValue(raw.offerId),
  });
  const stay = parseHotelStayParams({ raw, today });

  return route.success && stay ? { ...route.data, stay } : null;
};
