import {
  serializeHotelStayParams,
  type HotelStay,
} from 'shared/lib/stay/stay-params';

// One place for the URLs more than one feature links to: the checkout URL is written by
// the hotel page and read back by the booking page, so a drift would break Reserve.

export const TRIPS_PATH = '/trips';

export const buildTripHref = (bookingId: string) =>
  `${TRIPS_PATH}?${new URLSearchParams({ booking: bookingId }).toString()}`;

// The hotel page keys its query on the stay alone, so the place is left out of the link.
export const buildHotelHref = ({
  hotelId,
  stay,
}: {
  hotelId: string;
  stay: HotelStay;
}) =>
  `/hotels/${encodeURIComponent(hotelId)}?${serializeHotelStayParams(stay)}`;

export const buildCheckoutHref = ({
  hotelId,
  offerId,
  stay,
}: {
  hotelId: string;
  offerId: string;
  stay: HotelStay;
}) => {
  const offer = new URLSearchParams({ offerId }).toString();

  return `/hotels/${encodeURIComponent(hotelId)}/book?${offer}&${serializeHotelStayParams(stay)}`;
};
