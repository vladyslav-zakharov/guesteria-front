import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { buildPrefillHref } from 'features/hotel-results/lib/results-url';
import { parseResultsParams } from 'features/hotel-results/schemas/results-params';
import { HotelResults } from 'features/hotel-results/ui/hotel-results/hotel-results';
import { getUtcToday } from 'shared/lib/dayjs';
import {
  parseStayParams,
  parseStayPrefill,
  type SearchParamsRecord,
} from 'shared/lib/stay/stay-params';

type Props = {
  // Typed by hand: the global PageProps helper comes from `next dev` or `next build`, and
  // `yarn typescript` runs without either.
  searchParams: Promise<SearchParamsRecord>;
};

export const metadata: Metadata = {
  title: 'Search results',
};

// Hotel rates take several seconds, so they are fetched in the browser behind a skeleton
// instead of blocking the server render.
const SearchPage = async ({ searchParams }: Props) => {
  const raw = await searchParams;
  // The back validates stays against the UTC calendar day, so the front uses the same day.
  const today = getUtcToday();
  const stay = parseStayParams({ raw, today });

  if (!stay) {
    redirect(buildPrefillHref(parseStayPrefill(raw)));
  }

  const { sort, refundableOnly } = parseResultsParams(raw);

  return (
    <HotelResults stay={stay} sort={sort} refundableOnly={refundableOnly} />
  );
};

export default SearchPage;
