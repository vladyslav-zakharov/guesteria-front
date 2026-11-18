import Image from 'next/image';
import Link from 'next/link';

import { BedDouble, MapPin } from 'lucide-react';

import type { IHotelCard } from 'entities/hotels/types/responses';
import { formatMoney } from 'shared/lib/format/format';
import { RatingBadge } from 'shared/ui/rating-badge';
import { Badge } from 'shared/ui/shadcn/badge';
import { Skeleton } from 'shared/ui/shadcn/skeleton';
import { Stars } from 'shared/ui/stars';

type Props = {
  hotel: IHotelCard;
  href: string;
  stayLabel: string;
};

const PHOTO_SIZES = '(max-width: 448px) 100vw, 448px';

export const HotelCard = ({ hotel, href, stayLabel }: Props) => (
  <article className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-card">
    <Link
      href={href}
      className="flex flex-col outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="relative aspect-16/10 w-full bg-muted">
        {hotel.photoUrl ? (
          <Image
            src={hotel.photoUrl}
            alt={hotel.name}
            fill
            sizes={PHOTO_SIZES}
            className="object-cover"
          />
        ) : (
          <BedDouble
            aria-hidden
            className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-muted-foreground"
          />
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-base leading-snug font-semibold wrap-break-word">
            {hotel.name}
          </h2>
          <Stars stars={hotel.stars} />
        </div>
        <RatingBadge rating={hotel.rating} reviewCount={hotel.reviewCount} />
        <p className="flex min-w-0 items-start gap-1 text-sm text-muted-foreground">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0 wrap-break-word">{hotel.address}</span>
        </p>
        <div className="flex items-end justify-between gap-3 pt-1">
          {hotel.refundable ? (
            <Badge className="bg-success/10 text-success">
              Free cancellation
            </Badge>
          ) : (
            <span />
          )}
          <div className="flex flex-col items-end text-right">
            <span className="text-lg font-bold tabular-nums">
              {formatMoney(hotel.price)}
            </span>
            <span className="text-xs text-muted-foreground">{stayLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  </article>
);

export const HotelCardSkeleton = () => (
  <div
    aria-hidden
    className="overflow-hidden rounded-xl border bg-card shadow-card"
  >
    <Skeleton className="aspect-16/10 w-full rounded-none" />
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-end">
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  </div>
);
