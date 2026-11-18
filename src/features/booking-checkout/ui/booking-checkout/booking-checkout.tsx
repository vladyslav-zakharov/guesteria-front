'use client';

import { useEffect, useState } from 'react';

import { CircleAlert, LockKeyhole } from 'lucide-react';

import { useMe } from 'entities/auth/hooks/get';
import type { IUser } from 'entities/auth/types/responses';
import { buildCheckoutHref } from 'shared/lib/routes/routes';
import { shouldPromptSignIn } from 'shared/lib/session';
import { useAuthSheetStore } from 'shared/store/auth-sheet';
import { Button } from 'shared/ui/shadcn/button';
import { Skeleton } from 'shared/ui/shadcn/skeleton';
import { StateMessage } from 'shared/ui/state-message';

import { getCheckoutView } from '../../lib/checkout-view';
import type { CheckoutParams } from '../../schemas/checkout-params';
import { CheckoutFlow } from '../checkout-flow/checkout-flow';

type Props = CheckoutParams;

const CheckoutSkeleton = () => (
  <div role="status" className="flex flex-col gap-4 px-4 pt-4">
    <span className="sr-only">Loading…</span>
    <Skeleton aria-hidden className="h-8 w-2/3" />
    <Skeleton aria-hidden className="h-48 w-full rounded-xl" />
    <Skeleton aria-hidden className="h-72 w-full rounded-xl" />
  </div>
);

export const BookingCheckout = ({ hotelId, offerId, stay }: Props) => {
  const me = useMe();
  const openAuthSheet = useAuthSheetStore(state => state.open);
  const checkoutHref = buildCheckoutHref({ hotelId, offerId, stay });
  // The last user this page saw: it keeps the flow mounted when `me` later fails to
  // refetch or turns null (see getCheckoutView).
  const [knownUser, setKnownUser] = useState<IUser | null>(me.data ?? null);

  if (me.data && me.data !== knownUser) {
    setKnownUser(me.data);
  }

  const view = getCheckoutView({
    hasKnownUser: knownUser !== null,
    isPending: me.isPending,
    isLoadingError: me.isLoadingError,
  });
  const isPromptNeeded = shouldPromptSignIn({
    isSignedOut: me.data === null,
    hasBeenSignedIn: knownUser !== null,
  });

  // After sign-in the auth sheet sends the guest back to this same URL.
  useEffect(() => {
    if (isPromptNeeded) {
      openAuthSheet(checkoutHref);
    }
  }, [isPromptNeeded, checkoutHref, openAuthSheet]);

  if (view === 'flow' && knownUser) {
    return (
      <CheckoutFlow
        key={knownUser.id}
        hotelId={hotelId}
        offerId={offerId}
        stay={stay}
        user={knownUser}
        checkoutHref={checkoutHref}
      />
    );
  }

  if (view === 'loading') {
    return <CheckoutSkeleton />;
  }

  if (view === 'error') {
    return (
      <StateMessage
        tone="error"
        titleAs="h1"
        icon={<CircleAlert />}
        title="We couldn't check your account"
        description="Check your connection and try again."
        action={
          <Button
            type="button"
            className="h-11 w-full"
            onClick={() => me.refetch()}
          >
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <StateMessage
      titleAs="h1"
      icon={<LockKeyhole />}
      title="Sign in to continue"
      description="You need a StayHub account to book this stay."
      action={
        <Button
          type="button"
          className="h-11 w-full"
          onClick={event => openAuthSheet(checkoutHref, event.currentTarget)}
        >
          Sign in
        </Button>
      }
    />
  );
};
