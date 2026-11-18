import type { Metadata } from 'next';

import { GuestHubSheet } from 'features/guest-hub/ui/guest-hub-sheet/guest-hub-sheet';
import { parseBookingParam } from 'features/trips/schemas/trips-params';
import { Trips } from 'features/trips/ui/trips/trips';
import type { SearchParamsRecord } from 'shared/lib/stay/stay-params';

type Props = {
  // Typed by hand: the global PageProps helper comes from `next dev` or `next build`, and
  // `yarn typescript` runs without either.
  searchParams: Promise<SearchParamsRecord>;
};

export const metadata: Metadata = {
  title: 'Trips',
};

// Features cannot import each other, so the page composes the trip list and the Guest Hub
// sheet, and the `booking` param drives both.
const TripsPage = async ({ searchParams }: Props) => {
  const bookingId = parseBookingParam(await searchParams);

  return (
    <>
      <Trips bookingId={bookingId} />
      <GuestHubSheet bookingId={bookingId} />
    </>
  );
};

export default TripsPage;
