import type { IBooking } from 'entities/bookings/types/responses';
import { parseStayDate } from 'shared/lib/format/format';

type TripGroups = {
  upcoming: IBooking[];
  past: IBooking[];
};

// `YYYY-MM-DD` strings sort in calendar order, so no date parsing is needed to order them.
const byCheckin = (left: IBooking, right: IBooking) =>
  left.checkin.localeCompare(right.checkin) ||
  left.createdAt.localeCompare(right.createdAt);

// A stay is still upcoming on its checkout day: the guest may be at the hotel and still
// need the concierge.
export const groupTrips = ({
  bookings,
  today,
}: {
  bookings: IBooking[];
  today: string;
}): TripGroups => {
  const todayDate = parseStayDate(today);
  const isPast = ({ checkout }: IBooking) =>
    parseStayDate(checkout).isBefore(todayDate, 'day');

  return {
    upcoming: bookings.filter(booking => !isPast(booking)).sort(byCheckin),
    past: bookings.filter(isPast).sort((left, right) => byCheckin(right, left)),
  };
};
