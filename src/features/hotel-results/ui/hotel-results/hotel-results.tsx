'use client';

import { useOptimistic, useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Check, CircleAlert, Pencil, SearchX } from 'lucide-react';

import { useGetHotels } from 'entities/hotels/hooks/get';
import {
  describeGuests,
  describeNights,
} from 'shared/lib/format/describe-stay';
import { formatDateRange } from 'shared/lib/format/format';
import { buildHotelHref } from 'shared/lib/routes/routes';
import type { StayParams } from 'shared/lib/stay/stay-params';
import { cn } from 'shared/lib/styles';
import { Button } from 'shared/ui/shadcn/button';
import { StateMessage } from 'shared/ui/state-message';

import { getResultsError } from '../../lib/results-error-message';
import {
  buildPrefillHref,
  buildResultsHref,
  toHotelStay,
} from '../../lib/results-url';
import type { ResultsParams, ResultsSort } from '../../schemas/results-params';
import { HotelCard, HotelCardSkeleton } from '../hotel-card/hotel-card';

type Props = { stay: StayParams } & ResultsParams;

const SKELETON_COUNT = 6;
const SKELETON_SLOTS = Array.from(
  { length: SKELETON_COUNT },
  (_, slot) => slot,
);

const SORT_OPTIONS: { value: ResultsSort; label: string }[] = [
  { value: 'price', label: 'Lowest price' },
  { value: 'rating', label: 'Top rated' },
];

const CHIP_CLASS = 'h-11 rounded-full px-4';
const CHIP_ACTIVE_CLASS =
  'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground';

const ResultsSkeleton = () => (
  <div role="status" className="flex flex-col gap-4">
    <p className="text-sm text-muted-foreground">
      Checking live prices. This can take a few seconds.
    </p>
    <span className="sr-only">Loading stays…</span>
    {SKELETON_SLOTS.map(slot => (
      <HotelCardSkeleton key={slot} />
    ))}
  </div>
);

export const HotelResults = ({ stay, sort, refundableOnly }: Props) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // The URL is the source of truth, but the server round trip after router.replace
  // would leave the chips unchanged for a moment; the optimistic copy shows the choice
  // and starts the new query at once, then yields to the props from the new URL.
  const [filters, setOptimisticFilters] = useOptimistic<ResultsParams>({
    sort,
    refundableOnly,
  });
  const hotelStay = toHotelStay(stay);
  const hotelsQuery = useGetHotels({
    placeId: stay.placeId,
    ...hotelStay,
    sort: filters.sort,
    refundableOnly: filters.refundableOnly,
  });
  const changeSearchHref = buildPrefillHref(stay);
  const guestsLabel = describeGuests(stay);

  const updateFilters = (next: Partial<ResultsParams>) => {
    const nextFilters = { ...filters, ...next };

    startTransition(() => {
      setOptimisticFilters(nextFilters);
      router.replace(buildResultsHref({ stay, ...nextFilters }), {
        scroll: false,
      });
    });
  };

  const renderContent = () => {
    if (
      hotelsQuery.isPending ||
      (hotelsQuery.isError && hotelsQuery.isFetching)
    ) {
      return <ResultsSkeleton />;
    }

    if (hotelsQuery.isError) {
      const { message, canRetry } = getResultsError(hotelsQuery.error);

      return (
        <StateMessage
          tone="error"
          icon={<CircleAlert />}
          title="We couldn't load stays"
          description={message}
          action={
            canRetry ? (
              <Button
                type="button"
                className="h-11 w-full"
                onClick={() => hotelsQuery.refetch()}
              >
                Retry
              </Button>
            ) : (
              <Button asChild className="h-11 w-full">
                <Link href={changeSearchHref}>Change search</Link>
              </Button>
            )
          }
        />
      );
    }

    const { hotels, nights } = hotelsQuery.data;

    if (hotels.length === 0) {
      return (
        <StateMessage
          icon={<SearchX />}
          title="No stays match these dates"
          description={
            filters.refundableOnly
              ? 'Try other dates, or turn off Free cancellation.'
              : 'Try other dates or another destination.'
          }
          action={
            <Button asChild variant="outline" className="h-11 w-full">
              <Link href={changeSearchHref}>Change search</Link>
            </Button>
          }
        />
      );
    }

    const stayLabel = `${describeNights(nights)}, ${guestsLabel}`;

    return (
      <div className="flex flex-col gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {hotels.length === 1 ? '1 stay' : `${hotels.length} stays`}
        </p>
        <ul className="flex flex-col gap-4">
          {hotels.map(hotel => (
            <li key={hotel.hotelId}>
              <HotelCard
                hotel={hotel}
                stayLabel={stayLabel}
                href={buildHotelHref({
                  hotelId: hotel.hotelId,
                  stay: hotelStay,
                })}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <h1 className="sr-only">{`Stays in ${stay.placeName}`}</h1>
      <div className="sticky top-0 z-30 bg-background/95 px-4 pt-4 pb-3 backdrop-blur">
        <Link
          href={changeSearchHref}
          className="flex min-h-14 items-center gap-3 rounded-xl border bg-card px-4 py-2 shadow-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="sr-only">Change search: </span>
            <span className="truncate text-base font-semibold">
              {stay.placeName}
            </span>
            <span className="truncate text-sm text-muted-foreground">
              {`${formatDateRange(stay)} · ${guestsLabel}`}
            </span>
          </span>
          <Pencil aria-hidden className="size-5 shrink-0 text-primary" />
        </Link>
      </div>
      <div className="flex flex-col gap-4 px-4 pt-1 pb-6">
        <div className="flex flex-wrap gap-2">
          <div role="group" aria-label="Sort stays" className="flex gap-2">
            {SORT_OPTIONS.map(option => {
              const isActive = filters.sort === option.value;

              return (
                <Button
                  key={option.value}
                  type="button"
                  variant="outline"
                  aria-pressed={isActive}
                  className={cn(CHIP_CLASS, isActive && CHIP_ACTIVE_CLASS)}
                  onClick={() => updateFilters({ sort: option.value })}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            aria-pressed={filters.refundableOnly}
            className={cn(
              CHIP_CLASS,
              filters.refundableOnly && CHIP_ACTIVE_CLASS,
            )}
            onClick={() =>
              updateFilters({ refundableOnly: !filters.refundableOnly })
            }
          >
            {filters.refundableOnly && <Check aria-hidden />}
            Free cancellation
          </Button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};
