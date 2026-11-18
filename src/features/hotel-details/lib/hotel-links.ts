import {
  serializeHotelStayParams,
  type HotelStay,
} from 'shared/lib/stay/stay-params';

// Without a place the search form opens with the dates and guests filled in and asks
// for the destination again.
export const buildChangeDatesHref = (stay: HotelStay) =>
  `/?${serializeHotelStayParams(stay)}`;
