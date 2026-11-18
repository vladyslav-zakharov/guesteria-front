import { useId } from 'react';

import { CircleCheck, CircleX, Utensils } from 'lucide-react';

import type { IOffer } from 'entities/hotels/types/responses';
import { describeCancellation } from 'shared/lib/format/describe-stay';
import { formatMoney } from 'shared/lib/format/format';
import { cn } from 'shared/lib/styles';
import { Button } from 'shared/ui/shadcn/button';

type Props = {
  offer: IOffer;
  stayLabel: string;
  onReserve: (offerId: string) => void;
};

export const OfferCard = ({ offer, stayLabel, onReserve }: Props) => {
  const titleId = useId();
  const CancellationIcon = offer.refundable ? CircleCheck : CircleX;

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground shadow-card"
    >
      <div className="flex flex-col gap-1.5">
        <h3 id={titleId} className="leading-snug font-semibold wrap-break-word">
          {offer.roomName}
        </h3>
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
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-lg font-bold tabular-nums">
            {formatMoney(offer.price)}
          </span>
          <span className="text-xs text-muted-foreground">{stayLabel}</span>
        </div>
        <Button
          type="button"
          aria-describedby={titleId}
          className="h-11 px-6"
          onClick={() => onReserve(offer.offerId)}
        >
          Reserve
        </Button>
      </div>
    </article>
  );
};
