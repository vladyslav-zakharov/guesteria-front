import { useReducer } from 'react';

import { useRouter } from 'next/navigation';

import type { IUser } from 'entities/auth/types/responses';
import { useCreateBooking, usePrebook } from 'entities/bookings/hooks/post';
import type { IPrebook } from 'entities/bookings/types/responses';
import { useGetHotel } from 'entities/hotels/hooks/get';
import { buildHotelHref, buildTripHref } from 'shared/lib/routes/routes';
import { useAuthSheetStore } from 'shared/store/auth-sheet';

import { isSessionExpired } from '../../lib/checkout-error';
import {
  checkoutReducer,
  INITIAL_CHECKOUT_STATE,
  needsPriceConfirmation,
} from '../../lib/checkout-state';
import {
  canSubmitCheckout,
  getOfferAvailability,
} from '../../lib/offer-availability';
import type { CheckoutParams } from '../../schemas/checkout-params';
import type { GuestDetails } from '../../schemas/guest-form';
import { BookingSummary } from '../booking-summary/booking-summary';
import { CheckoutStatus } from '../checkout-status/checkout-status';
import { GuestForm } from '../guest-form/guest-form';

type Props = CheckoutParams & {
  user: IUser;
  checkoutHref: string;
};

export const CheckoutFlow = ({
  hotelId,
  offerId,
  stay,
  user,
  checkoutHref,
}: Props) => {
  const router = useRouter();
  const openAuthSheet = useAuthSheetStore(state => state.open);
  const [state, dispatch] = useReducer(checkoutReducer, INITIAL_CHECKOUT_STATE);
  // Same params as the hotel page, so a guest who came from there reuses its cached
  // response instead of waiting for rates again.
  const hotelQuery = useGetHotel({ hotelId, stay });
  const prebookMutation = usePrebook();
  const bookingMutation = useCreateBooking();
  const hotelHref = buildHotelHref({ hotelId, stay });
  const offer =
    hotelQuery.data?.offers.find(candidate => candidate.offerId === offerId) ??
    null;
  const availability = getOfferAvailability({
    offerId,
    offers: hotelQuery.data?.offers,
    isPending: hotelQuery.isPending,
  });
  const canSubmit = canSubmitCheckout(availability);

  const handleFailure = (error: unknown) => {
    if (isSessionExpired(error)) {
      openAuthSheet(checkoutHref);
    }

    dispatch({ type: 'failed', error });
  };

  const book = ({
    guest,
    prebook,
  }: {
    guest: GuestDetails;
    prebook: IPrebook;
  }) =>
    bookingMutation.mutate(
      {
        prebookId: prebook.id,
        guest: {
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
        },
        specialRequests: guest.specialRequests || undefined,
      },
      {
        onSuccess: ({ booking }) => {
          dispatch({ type: 'bookSucceeded', bookingId: booking.id });
          router.replace(buildTripHref(booking.id));
        },
        onError: handleFailure,
      },
    );

  const handleSubmit = (guest: GuestDetails) => {
    if (state.status !== 'idle' || !canSubmit) {
      return;
    }

    const quotedPrice = offer?.price ?? null;

    dispatch({ type: 'submit', guest, quotedPrice });
    prebookMutation.mutate(
      { hotelId, offerId, ...stay },
      {
        onSuccess: ({ prebook }) => {
          dispatch({ type: 'prebookSucceeded', prebook });

          if (!needsPriceConfirmation({ prebook, quotedPrice })) {
            book({ guest, prebook });
          }
        },
        onError: handleFailure,
      },
    );
  };

  const handleConfirmPrice = () => {
    if (state.status !== 'priceChanged') {
      return;
    }

    dispatch({ type: 'confirmPrice' });
    book({ guest: state.guest, prebook: state.prebook });
  };

  return (
    <>
      <div
        inert={state.status !== 'idle'}
        className="flex flex-col gap-6 px-4 pt-4 pb-6"
      >
        <h1 className="text-2xl font-bold">Confirm your stay</h1>
        <BookingSummary
          stay={stay}
          hotel={hotelQuery.data?.hotel ?? null}
          offer={offer}
          isLoading={hotelQuery.isPending}
        />
        <GuestForm
          defaultValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: '',
            specialRequests: '',
          }}
          onSubmit={handleSubmit}
          isSubmitDisabled={!canSubmit}
        />
      </div>
      {state.status !== 'idle' && (
        <CheckoutStatus
          state={state}
          hotelHref={hotelHref}
          onConfirmPrice={handleConfirmPrice}
          onRetry={() => dispatch({ type: 'retry' })}
        />
      )}
    </>
  );
};
