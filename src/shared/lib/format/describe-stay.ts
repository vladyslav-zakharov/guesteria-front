import { formatInstant } from './format';

export const pluralize = ({ count, word }: { count: number; word: string }) =>
  `${count} ${count === 1 ? word : `${word}s`}`;

const pluralizeChildren = (count: number) =>
  `${count} ${count === 1 ? 'child' : 'children'}`;

export const describeGuests = ({
  adults,
  children,
}: {
  adults: number;
  children: number[];
}) =>
  [
    pluralize({ count: adults, word: 'adult' }),
    children.length > 0 ? pluralizeChildren(children.length) : null,
  ]
    .filter(Boolean)
    .join(', ');

export const describeNights = (nights: number) =>
  pluralize({ count: nights, word: 'night' });

export const describeCancellation = ({
  refundable,
  cancellationDeadline,
}: {
  refundable: boolean;
  cancellationDeadline: string | null;
}) => {
  if (!refundable) {
    return 'Non-refundable';
  }

  return cancellationDeadline
    ? `Free cancellation until ${formatInstant(cancellationDeadline)}`
    : 'Free cancellation';
};
