'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useQueryClient } from '@tanstack/react-query';
import { CircleAlert, LockKeyhole, Luggage } from 'lucide-react';

import { meQueryOptions, useMe } from 'entities/auth/hooks/get';
import { useGetBookings } from 'entities/bookings/hooks/get';
import type { IBooking } from 'entities/bookings/types/responses';
import { HTTP_STATUS } from 'shared/constants/http';
import { useHasBeenTrue } from 'shared/hooks/use-has-been-true';
import { getUtcToday } from 'shared/lib/dayjs';
import { getApiError } from 'shared/lib/http/api-error';
import { buildTripHref, TRIPS_PATH } from 'shared/lib/routes/routes';
import { shouldPromptSignIn } from 'shared/lib/session';
import { useAuthSheetStore } from 'shared/store/auth-sheet';
import { Button } from 'shared/ui/shadcn/button';
import { StateMessage } from 'shared/ui/state-message';

import { groupTrips } from '../../lib/group-trips';
import { TripCard, TripCardSkeleton } from '../trip-card/trip-card';

type Props = {
  bookingId: string | null;
};

type TripsListProps = {
  // Where sign-in brings the guest back when the session ends on this page.
  redirectTo: string;
};

const SKELETON_CARDS = ['first', 'second', 'third'];

const TripsSkeleton = () => (
  <div role="status" className="flex flex-col gap-3">
    <span className="sr-only">Loading your trips…</span>
    {SKELETON_CARDS.map(key => (
      <TripCardSkeleton key={key} />
    ))}
  </div>
);

const TripSection = ({
  id,
  title,
  bookings,
}: {
  id: string;
  title: string;
  bookings: IBooking[];
}) => {
  if (bookings.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="text-lg font-semibold">
        {title}
      </h2>
      <ul className="flex flex-col gap-3">
        {bookings.map(booking => (
          <TripCard key={booking.id} booking={booking} />
        ))}
      </ul>
    </section>
  );
};

const TripsList = ({ redirectTo }: TripsListProps) => {
  const queryClient = useQueryClient();
  const openAuthSheet = useAuthSheetStore(state => state.open);
  const bookingsQuery = useGetBookings();
  // The UTC day, the one the back's stay dates are validated against. It is read once so
  // the groups do not shift while the page is open.
  const [today] = useState(getUtcToday);
  const isUnauthorized =
    getApiError(bookingsQuery.error)?.statusCode === HTTP_STATUS.unauthorized;

  // The session ended since `me` was cached: refreshing it moves the page to the
  // signed-out state, and the guest is asked to sign in again right here.
  useEffect(() => {
    if (isUnauthorized) {
      void queryClient.invalidateQueries({
        queryKey: meQueryOptions().queryKey,
      });
      openAuthSheet(redirectTo);
    }
  }, [isUnauthorized, queryClient, openAuthSheet, redirectTo]);

  if (bookingsQuery.isPending) {
    return <TripsSkeleton />;
  }

  // A failed background refetch keeps the loaded list; a 401 is handled above.
  if (bookingsQuery.isLoadingError) {
    return (
      <StateMessage
        tone="error"
        icon={<CircleAlert />}
        title="We couldn't load your trips"
        description="Check your connection and try again."
        action={
          <Button
            type="button"
            className="h-11 w-full"
            onClick={() => bookingsQuery.refetch()}
          >
            Retry
          </Button>
        }
      />
    );
  }

  if (bookingsQuery.data.bookings.length === 0) {
    return (
      <StateMessage
        icon={<Luggage />}
        title="No trips yet"
        description="When you book a stay, it shows up here."
        action={
          <Button asChild className="h-11 w-full">
            <Link href="/">Find a stay</Link>
          </Button>
        }
      />
    );
  }

  const { upcoming, past } = groupTrips({
    bookings: bookingsQuery.data.bookings,
    today,
  });

  return (
    <div className="flex flex-col gap-6">
      <TripSection id="trips-upcoming" title="Upcoming" bookings={upcoming} />
      <TripSection id="trips-past" title="Past" bookings={past} />
    </div>
  );
};

const TripsGate = ({ bookingId }: Props) => {
  const me = useMe();
  const openAuthSheet = useAuthSheetStore(state => state.open);
  const redirectTo = bookingId ? buildTripHref(bookingId) : TRIPS_PATH;
  const hasBeenSignedIn = useHasBeenTrue(Boolean(me.data));
  const isPromptNeeded = shouldPromptSignIn({
    isSignedOut: me.data === null,
    hasBeenSignedIn,
  });

  // After sign-in the auth sheet brings the guest back here, with the trip still open.
  useEffect(() => {
    if (isPromptNeeded) {
      openAuthSheet(redirectTo);
    }
  }, [isPromptNeeded, redirectTo, openAuthSheet]);

  if (me.isPending) {
    return <TripsSkeleton />;
  }

  // A failed background refetch keeps the cached user and the trips on screen.
  if (me.isLoadingError) {
    return (
      <StateMessage
        tone="error"
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

  if (!me.data) {
    return (
      <StateMessage
        icon={<LockKeyhole />}
        title="Sign in to see your trips"
        description="Your bookings and the concierge chat live in your StayHub account."
        action={
          <Button
            type="button"
            className="h-11 w-full"
            onClick={event => openAuthSheet(redirectTo, event.currentTarget)}
          >
            Sign in
          </Button>
        }
      />
    );
  }

  return <TripsList key={me.data.id} redirectTo={redirectTo} />;
};

export const Trips = ({ bookingId }: Props) => (
  <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
    <h1 className="text-2xl font-bold">Trips</h1>
    <TripsGate bookingId={bookingId} />
  </div>
);
