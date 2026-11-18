import type { IPrebook } from 'entities/bookings/types/responses';
import type { IMoney } from 'shared/types/money';

import type { GuestDetails } from '../schemas/guest-form';
import { getCheckoutFailure, type CheckoutFailure } from './checkout-error';

export type CheckoutState =
  | { status: 'idle' }
  | { status: 'prebooking'; guest: GuestDetails; quotedPrice: IMoney | null }
  | {
      status: 'priceChanged';
      guest: GuestDetails;
      prebook: IPrebook;
      previousPrice: IMoney | null;
    }
  | { status: 'booking'; guest: GuestDetails; prebook: IPrebook }
  | { status: 'done'; bookingId: string }
  | { status: 'failed'; failure: CheckoutFailure };

export type CheckoutStatus = CheckoutState['status'];

export type CheckoutEvent =
  | { type: 'submit'; guest: GuestDetails; quotedPrice: IMoney | null }
  | { type: 'prebookSucceeded'; prebook: IPrebook }
  | { type: 'confirmPrice' }
  | { type: 'bookSucceeded'; bookingId: string }
  | { type: 'failed'; error: unknown }
  | { type: 'retry' };

export const INITIAL_CHECKOUT_STATE: CheckoutState = { status: 'idle' };

const isSamePrice = (left: IMoney, right: IMoney) =>
  left.amount === right.amount && left.currency === right.currency;

// The guest confirms again whenever the price to be booked is not the one they saw: when
// the provider flags a change, when the cached offer price differs, or when no price was
// on screen at all (the offer had dropped out of a refreshed hotel response). The
// component calls this too, to decide whether to book straight after the prebook.
export const needsPriceConfirmation = ({
  prebook,
  quotedPrice,
}: {
  prebook: IPrebook;
  quotedPrice: IMoney | null;
}) =>
  prebook.priceChanged ||
  !quotedPrice ||
  !isSamePrice(quotedPrice, prebook.price);

// Pure transitions only; the component runs the requests. An event that does not fit
// the current state is ignored, so a late response can never move the flow backwards.
export const checkoutReducer = (
  state: CheckoutState,
  event: CheckoutEvent,
): CheckoutState => {
  switch (event.type) {
    case 'submit':
      return state.status === 'idle'
        ? {
            status: 'prebooking',
            guest: event.guest,
            quotedPrice: event.quotedPrice,
          }
        : state;

    case 'prebookSucceeded':
      if (state.status !== 'prebooking') {
        return state;
      }

      return needsPriceConfirmation({
        prebook: event.prebook,
        quotedPrice: state.quotedPrice,
      })
        ? {
            status: 'priceChanged',
            guest: state.guest,
            prebook: event.prebook,
            previousPrice: state.quotedPrice,
          }
        : { status: 'booking', guest: state.guest, prebook: event.prebook };

    case 'confirmPrice':
      return state.status === 'priceChanged'
        ? { status: 'booking', guest: state.guest, prebook: state.prebook }
        : state;

    case 'bookSucceeded':
      return state.status === 'booking'
        ? { status: 'done', bookingId: event.bookingId }
        : state;

    case 'failed':
      if (state.status === 'prebooking' || state.status === 'booking') {
        return {
          status: 'failed',
          failure: getCheckoutFailure({
            stage: state.status === 'prebooking' ? 'prebook' : 'book',
            error: event.error,
          }),
        };
      }

      return state;

    case 'retry':
      return state.status === 'failed' && state.failure.canRetry
        ? INITIAL_CHECKOUT_STATE
        : state;

    default:
      return state;
  }
};
