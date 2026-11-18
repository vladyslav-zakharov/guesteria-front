import { cn } from 'shared/lib/styles';

type Props = {
  rating: number | null;
  reviewCount?: number | null;
  className?: string;
};

const LOCALE = 'en-GB';
const RATING_SCALE = 10;

const ratingFormat = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const countFormat = new Intl.NumberFormat(LOCALE);

const formatReviews = (count: number) =>
  `${countFormat.format(count)} ${count === 1 ? 'review' : 'reviews'}`;

// LiteAPI guest ratings are on a 0–10 scale; an unrated hotel renders nothing rather
// than a misleading 0.
export const RatingBadge = ({ rating, reviewCount, className }: Props) => {
  if (rating === null) {
    return null;
  }

  const value = ratingFormat.format(rating);

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-sm', className)}>
      <span
        aria-hidden
        className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground tabular-nums"
      >
        {value}
      </span>
      <span className="sr-only">{`Rated ${value} out of ${RATING_SCALE}`}</span>
      {reviewCount ? (
        <span className="text-muted-foreground">
          {formatReviews(reviewCount)}
        </span>
      ) : null}
    </span>
  );
};
