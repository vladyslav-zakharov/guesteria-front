import { Star } from 'lucide-react';

import { cn } from 'shared/lib/styles';

type Props = {
  stars: number | null;
  className?: string;
};

const MAX_STARS = 5;
const STAR_SLOTS = Array.from({ length: MAX_STARS }, (_, index) => index);

// The API sends null for an unclassified hotel; it renders nothing instead of empty stars.
export const Stars = ({ stars, className }: Props) => {
  if (!stars) {
    return null;
  }

  const filled = Math.min(Math.round(stars), MAX_STARS);

  return (
    <span
      role="img"
      aria-label={`${stars}-star hotel`}
      className={cn('inline-flex items-center gap-0.5 text-warning', className)}
    >
      {STAR_SLOTS.slice(0, filled).map(slot => (
        <Star key={slot} aria-hidden className="size-3.5 fill-current" />
      ))}
    </span>
  );
};
