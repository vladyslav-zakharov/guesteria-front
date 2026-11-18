import Image from 'next/image';
import Link from 'next/link';

import { BedDouble, ChevronRight } from 'lucide-react';

import type {
  BookingStatus,
  IBooking,
} from 'entities/bookings/types/responses';
import { formatDateRange } from 'shared/lib/format/format';
import { buildTripHref } from 'shared/lib/routes/routes';
import { cn } from 'shared/lib/styles';
import { Badge } from 'shared/ui/shadcn/badge';
import { Skeleton } from 'shared/ui/shadcn/skeleton';

type Props = {
  booking: IBooking;
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
};

const isSecurePhoto = (url: string | null): url is string =>
  url?.startsWith('https:') ?? false;

export const TripCard = ({ booking }: Props) => (
  <li className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-card">
    <Link
      href={buildTripHref(booking.id)}
      replace
      scroll={false}
      className="flex min-h-11 items-stretch gap-3 p-3 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted">
        {isSecurePhoto(booking.hotel.photoUrl) ? (
          <Image
            src={booking.hotel.photoUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <BedDouble
            aria-hidden
            className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-muted-foreground"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-base leading-snug font-semibold wrap-break-word">
          {booking.hotel.name}
        </h3>
        <p className="text-sm">
          {formatDateRange({
            checkin: booking.checkin,
            checkout: booking.checkout,
          })}
        </p>
        <p className="text-sm wrap-break-word text-muted-foreground">
          {booking.roomName}
        </p>
        <Badge
          className={cn(
            'mt-auto',
            booking.status === 'CONFIRMED'
              ? 'bg-success/10 text-success'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {STATUS_LABELS[booking.status]}
        </Badge>
      </div>
      <ChevronRight
        aria-hidden
        className="size-5 shrink-0 self-center text-muted-foreground"
      />
    </Link>
  </li>
);

export const TripCardSkeleton = () => (
  <div
    aria-hidden
    className="flex gap-3 rounded-xl border bg-card p-3 shadow-card"
  >
    <Skeleton className="size-24 shrink-0 rounded-lg" />
    <div className="flex flex-1 flex-col gap-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-auto h-5 w-20 rounded-full" />
    </div>
  </div>
);
