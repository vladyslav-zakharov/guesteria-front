import type { IOffer } from 'entities/hotels/types/responses';

export type OfferAvailability = 'loading' | 'found' | 'unknown';

// LiteAPI issues new offer ids on every rates call, so an id missing from a fresh hotel
// response (a reload, a refetch on focus) says nothing about the room. Only the prebook
// knows: the back rejects an offer that no longer matches the stay (400), a sold-out room
// is a 409, and a new price goes through the confirmation step.
export const getOfferAvailability = ({
  offerId,
  offers,
  isPending,
}: {
  offerId: string;
  offers: IOffer[] | undefined;
  isPending: boolean;
}): OfferAvailability => {
  if (offers?.some(offer => offer.offerId === offerId)) {
    return 'found';
  }

  return isPending ? 'loading' : 'unknown';
};

// While the offers load, the price on screen is not known yet, and a prebook started then
// would always ask the guest to confirm it.
export const canSubmitCheckout = (availability: OfferAvailability) =>
  availability !== 'loading';
