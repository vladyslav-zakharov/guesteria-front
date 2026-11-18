import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { isValidHotelId } from 'features/hotel-details/schemas/hotel-id';
import { HotelDetails } from 'features/hotel-details/ui/hotel-details/hotel-details';
import { getUtcToday } from 'shared/lib/dayjs';
import {
  parseHotelStayParams,
  type SearchParamsRecord,
} from 'shared/lib/stay/stay-params';

type Props = {
  // Typed by hand: the global PageProps helper comes from `next dev` or `next build`, and
  // `yarn typescript` runs without either.
  params: Promise<{ hotelId: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

export const metadata: Metadata = {
  title: 'Hotel',
};

// Rates for one hotel take several seconds uncached, so they load in the browser behind
// a skeleton instead of blocking the server render.
const HotelPage = async ({ params, searchParams }: Props) => {
  const [{ hotelId }, raw] = await Promise.all([params, searchParams]);

  if (!isValidHotelId(hotelId)) {
    notFound();
  }

  // The back validates stays against the UTC calendar day, so the front uses the same day.
  const today = getUtcToday();
  const stay = parseHotelStayParams({ raw, today });

  if (!stay) {
    redirect('/');
  }

  return <HotelDetails hotelId={hotelId} stay={stay} />;
};

export default HotelPage;
