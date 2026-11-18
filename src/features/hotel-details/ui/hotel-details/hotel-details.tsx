'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  BedDouble,
  CalendarDays,
  ChevronLeft,
  CircleAlert,
  Clock,
  MapPin,
} from 'lucide-react';

import { useMe } from 'entities/auth/hooks/get';
import { useGetHotel } from 'entities/hotels/hooks/get';
import type { IHotelDetails } from 'entities/hotels/types/responses';
import {
  describeGuests,
  describeNights,
} from 'shared/lib/format/describe-stay';
import { formatDateRange } from 'shared/lib/format/format';
import { buildCheckoutHref } from 'shared/lib/routes/routes';
import type { HotelStay } from 'shared/lib/stay/stay-params';
import { cn } from 'shared/lib/styles';
import { useAuthSheetStore } from 'shared/store/auth-sheet';
import { RatingBadge } from 'shared/ui/rating-badge';
import { Button } from 'shared/ui/shadcn/button';
import { Skeleton } from 'shared/ui/shadcn/skeleton';
import { Stars } from 'shared/ui/stars';
import { StateMessage } from 'shared/ui/state-message';

import { formatLocation } from '../../lib/format-location';
import { getHotelError, isHotelNotFound } from '../../lib/hotel-error';
import { buildChangeDatesHref } from '../../lib/hotel-links';
import { HotelFacilities } from '../hotel-facilities/hotel-facilities';
import { OfferCard } from '../offer-card/offer-card';
import { PhotoGallery } from '../photo-gallery/photo-gallery';

type Props = {
  hotelId: string;
  stay: HotelStay;
};

// Past this length the description starts clamped, so the rooms stay within reach.
const DESCRIPTION_CLAMP_CHARS = 320;

const HotelDetailsSkeleton = () => (
  <div role="status" className="flex flex-col gap-4">
    <span className="sr-only">Loading the hotel…</span>
    <Skeleton aria-hidden className="aspect-4/3 w-full rounded-none" />
    <div aria-hidden className="flex flex-col gap-3 px-4">
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
    <p className="px-4 text-sm text-muted-foreground">
      Checking live prices. This can take a few seconds.
    </p>
    <div aria-hidden className="flex flex-col gap-3 px-4">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  </div>
);

const HotelDescription = ({ description }: { description: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = description.length > DESCRIPTION_CLAMP_CHARS;

  if (!description.trim()) {
    return null;
  }

  return (
    <section aria-labelledby="hotel-about" className="flex flex-col gap-2">
      <h2 id="hotel-about" className="text-lg font-semibold">
        About this stay
      </h2>
      <p
        id="hotel-description"
        className={cn(
          'text-sm leading-relaxed wrap-break-word whitespace-pre-line',
          isLong && !isExpanded && 'line-clamp-5',
        )}
      >
        {description}
      </p>
      {isLong && (
        <Button
          type="button"
          variant="link"
          aria-expanded={isExpanded}
          aria-controls="hotel-description"
          className="h-11 self-start px-0"
          onClick={() => setIsExpanded(expanded => !expanded)}
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </section>
  );
};

const HotelTimes = ({
  checkinTime,
  checkoutTime,
}: Pick<IHotelDetails, 'checkinTime' | 'checkoutTime'>) => {
  if (!checkinTime && !checkoutTime) {
    return null;
  }

  return (
    <section aria-labelledby="hotel-times" className="flex flex-col gap-2">
      <h2 id="hotel-times" className="text-lg font-semibold">
        Check-in and check-out
      </h2>
      <dl className="grid grid-cols-2 gap-3">
        {checkinTime && (
          <div className="flex flex-col gap-0.5 rounded-xl border bg-card p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock aria-hidden className="size-3.5" />
              Check-in
            </dt>
            <dd className="font-semibold">{`From ${checkinTime}`}</dd>
          </div>
        )}
        {checkoutTime && (
          <div className="flex flex-col gap-0.5 rounded-xl border bg-card p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock aria-hidden className="size-3.5" />
              Check-out
            </dt>
            <dd className="font-semibold">{`Until ${checkoutTime}`}</dd>
          </div>
        )}
      </dl>
    </section>
  );
};

export const HotelDetails = ({ hotelId, stay }: Props) => {
  const router = useRouter();
  const me = useMe();
  const openAuthSheet = useAuthSheetStore(state => state.open);
  const hotelQuery = useGetHotel({ hotelId, stay });
  const changeDatesHref = buildChangeDatesHref(stay);
  const guestsLabel = describeGuests(stay);

  // A visitor who opened the hotel from a shared link has no history to go back to.
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();

      return;
    }

    router.push('/');
  };

  // While the session check is still running, the booking page decides: it asks a
  // signed-out visitor to sign in itself.
  const handleReserve = (offerId: string) => {
    const href = buildCheckoutHref({ hotelId, offerId, stay });

    if (me.data === null) {
      openAuthSheet(href);

      return;
    }

    router.push(href);
  };

  const renderBody = () => {
    if (hotelQuery.isPending || (hotelQuery.isError && hotelQuery.isFetching)) {
      return <HotelDetailsSkeleton />;
    }

    if (hotelQuery.isError) {
      if (isHotelNotFound(hotelQuery.error)) {
        return (
          <StateMessage
            icon={<BedDouble />}
            title="This hotel is not available"
            description="It may no longer be listed. Search again to see other stays."
            action={
              <Button asChild className="h-11 w-full">
                <Link href={changeDatesHref}>Back to search</Link>
              </Button>
            }
          />
        );
      }

      const { message, canRetry } = getHotelError(hotelQuery.error);

      return (
        <StateMessage
          tone="error"
          icon={<CircleAlert />}
          title="We couldn't load this hotel"
          description={message}
          action={
            canRetry ? (
              <Button
                type="button"
                className="h-11 w-full"
                onClick={() => hotelQuery.refetch()}
              >
                Retry
              </Button>
            ) : (
              <Button asChild className="h-11 w-full">
                <Link href={changeDatesHref}>Change dates</Link>
              </Button>
            )
          }
        />
      );
    }

    const { hotel, offers, nights } = hotelQuery.data;
    const stayLabel = `${describeNights(nights)}, ${guestsLabel}`;

    return (
      <div className="flex flex-col gap-6">
        <PhotoGallery photos={hotel.photos} hotelName={hotel.name} />
        <div className="flex flex-col gap-6 px-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl leading-tight font-bold wrap-break-word">
              {hotel.name}
            </h1>
            <Stars stars={hotel.stars} />
            <RatingBadge
              rating={hotel.rating}
              reviewCount={hotel.reviewCount}
            />
            <p className="flex min-w-0 items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0 wrap-break-word">
                {[hotel.address, formatLocation(hotel)]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </p>
          </div>
          <section
            aria-labelledby="hotel-rooms"
            className="flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col">
                <h2 id="hotel-rooms" className="text-lg font-semibold">
                  Choose your room
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays aria-hidden className="size-4 shrink-0" />
                  <span className="min-w-0">
                    {`${formatDateRange(stay)} · ${guestsLabel}`}
                  </span>
                </p>
              </div>
              <Button
                asChild
                variant="link"
                className="h-11 shrink-0 px-0 text-sm"
              >
                <Link href={changeDatesHref}>Change dates</Link>
              </Button>
            </div>
            {offers.length === 0 ? (
              <StateMessage
                icon={<CalendarDays />}
                title="No rooms for these dates"
                description="This hotel has nothing left for your stay. Try other dates."
                className="rounded-xl border bg-card"
                action={
                  <Button asChild variant="outline" className="h-11 w-full">
                    <Link href={changeDatesHref}>Change dates</Link>
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {offers.map(offer => (
                  <li key={offer.offerId}>
                    <OfferCard
                      offer={offer}
                      stayLabel={stayLabel}
                      onReserve={handleReserve}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
          <HotelTimes
            checkinTime={hotel.checkinTime}
            checkoutTime={hotel.checkoutTime}
          />
          <HotelDescription description={hotel.description} />
          <HotelFacilities
            facilities={hotel.facilities}
            hotelName={hotel.name}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col pb-6">
      <div className="sticky top-0 z-30 flex items-center bg-background/95 px-2 py-1 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-1 px-2"
          onClick={handleBack}
        >
          <ChevronLeft aria-hidden className="size-5" />
          Back
        </Button>
      </div>
      {renderBody()}
    </div>
  );
};
