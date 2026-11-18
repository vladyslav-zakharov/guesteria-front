import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { parseCheckoutParams } from 'features/booking-checkout/schemas/checkout-params';
import { BookingCheckout } from 'features/booking-checkout/ui/booking-checkout/booking-checkout';
import { getUtcToday } from 'shared/lib/dayjs';
import type { SearchParamsRecord } from 'shared/lib/stay/stay-params';

type Props = {
  // Typed by hand: the global PageProps helper comes from `next dev` or `next build`, and
  // `yarn typescript` runs without either.
  params: Promise<{ hotelId: string }>;
  searchParams: Promise<SearchParamsRecord>;
};

export const metadata: Metadata = {
  title: 'Book your stay',
};

const BookPage = async ({ params, searchParams }: Props) => {
  const [{ hotelId }, raw] = await Promise.all([params, searchParams]);
  // The back validates stays against the UTC calendar day, so the front uses the same day.
  const today = getUtcToday();
  const checkout = parseCheckoutParams({ hotelId, raw, today });

  if (!checkout) {
    redirect('/');
  }

  return <BookingCheckout {...checkout} />;
};

export default BookPage;
