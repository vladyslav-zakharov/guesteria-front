import {
  CalendarDays,
  CircleCheck,
  CircleX,
  Users,
  Utensils,
} from 'lucide-react';

import type { IHotelDetails, IOffer } from 'entities/hotels/types/responses';
import {
  describeCancellation,
  describeGuests,
  describeNights,
} from 'shared/lib/format/describe-stay';
import {
  countNights,
  formatMoney,
  formatStayDate,
} from 'shared/lib/format/format';
import type { HotelStay } from 'shared/lib/stay/stay-params';
import { cn } from 'shared/lib/styles';
import { Separator } from 'shared/ui/shadcn/separator';
import { Skeleton } from 'shared/ui/shadcn/skeleton';

type Props = {
  stay: HotelStay;
  hotel: IHotelDetails | null;
  offer: IOffer | null;
  isLoading: boolean;
};

export const BookingSummary = ({ stay, hotel, offer, isLoading }: Props) => {
  const nights = countNights(stay);

  const renderOffer = () => {
    if (isLoading) {
      return (
        <div aria-hidden className="flex flex-col gap-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-24 self-end" />
        </div>
      );
    }

    if (!offer) {
      return (
        <p className="text-sm text-muted-foreground">
          We confirm the room and the final price in the next step.
        </p>
      );
    }

    const CancellationIcon = offer.refundable ? CircleCheck : CircleX;

    return (
      <div className="flex flex-col gap-1.5">
        <p className="font-semibold wrap-break-word">{offer.roomName}</p>
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <Utensils aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0 wrap-break-word">{offer.boardName}</span>
        </p>
        <p
          className={cn(
            'flex items-start gap-1.5 text-sm',
            offer.refundable ? 'text-success' : 'text-muted-foreground',
          )}
        >
          <CancellationIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0">{describeCancellation(offer)}</span>
        </p>
        <div className="flex items-end justify-between gap-3 pt-2">
          <span className="text-sm text-muted-foreground">
            {`Total for ${describeNights(nights)}`}
          </span>
          <span className="text-xl font-bold tabular-nums">
            {formatMoney(offer.price)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section
      aria-labelledby="booking-summary-title"
      aria-busy={isLoading}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-card"
    >
      <h2 id="booking-summary-title" className="sr-only">
        Your stay
      </h2>
      {isLoading && !hotel ? (
        <Skeleton aria-hidden className="h-6 w-3/4" />
      ) : (
        <p className="text-lg leading-snug font-semibold wrap-break-word">
          {hotel?.name ?? 'Your hotel'}
        </p>
      )}
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays aria-hidden className="size-4" />
            Check-in
          </dt>
          <dd className="font-medium">{formatStayDate(stay.checkin)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays aria-hidden className="size-4" />
            Check-out
          </dt>
          <dd className="font-medium">{formatStayDate(stay.checkout)}</dd>
        </div>
        <div className="col-span-2 flex flex-col gap-0.5">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <Users aria-hidden className="size-4" />
            Guests
          </dt>
          <dd className="font-medium">
            {`${describeNights(nights)}, ${describeGuests(stay)}`}
          </dd>
        </div>
      </dl>
      <Separator />
      {renderOffer()}
    </section>
  );
};
