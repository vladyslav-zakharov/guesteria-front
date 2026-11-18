import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { CircleAlert, X } from 'lucide-react';
import { toast } from 'sonner';

import { meQueryOptions } from 'entities/auth/hooks/get';
import { useGetBooking } from 'entities/bookings/hooks/get';
import { useGetMessages } from 'entities/messages/hooks/get';
import { useSendMessage } from 'entities/messages/hooks/post';
import { formatDateRange } from 'shared/lib/format/format';
import { buildTripHref } from 'shared/lib/routes/routes';
import { useAuthSheetStore } from 'shared/store/auth-sheet';
import { Button } from 'shared/ui/shadcn/button';
import {
  DrawerClose,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from 'shared/ui/shadcn/drawer';
import { Skeleton } from 'shared/ui/shadcn/skeleton';
import { StateMessage } from 'shared/ui/state-message';

import { describeRemaining } from '../../lib/chat-copy';
import {
  DAILY_LIMIT_MESSAGE,
  getChatError,
  TRIP_NOT_FOUND_MESSAGE,
} from '../../lib/chat-error';
import { isDailyLimitReached } from '../../lib/chat-limit';
import { ChatComposer } from '../chat-composer/chat-composer';
import { ChatThread, ChatThreadSkeleton } from '../chat-thread/chat-thread';

type Props = {
  bookingId: string;
  onClose: () => void;
};

const TRIP_NOT_FOUND_TOAST_ID = 'trip-not-found';

// Errors the sheet handles by itself (closing, or handing over to the auth sheet), so
// they never show inline.
const HANDLED_ELSEWHERE = new Set(['notFound', 'unauthorized', 'dailyLimit']);

export const GuestHubChat = ({ bookingId, onClose }: Props) => {
  const queryClient = useQueryClient();
  const bookingQuery = useGetBooking(bookingId);
  const messagesQuery = useGetMessages(bookingId);
  const sendMessage = useSendMessage(bookingId);
  const openAuthSheet = useAuthSheetStore(state => state.open);

  const loadError =
    (bookingQuery.error ?? messagesQuery.error)
      ? getChatError(bookingQuery.error ?? messagesQuery.error)
      : null;
  const sendError = sendMessage.error ? getChatError(sendMessage.error) : null;
  const errorKinds = [loadError?.kind, sendError?.kind];
  const isNotFound = errorKinds.includes('notFound');
  const isUnauthorized = errorKinds.includes('unauthorized');

  useEffect(() => {
    if (isNotFound) {
      toast.error(TRIP_NOT_FOUND_MESSAGE, { id: TRIP_NOT_FOUND_TOAST_ID });
      onClose();
    }
  }, [isNotFound, onClose]);

  // The session ended since `me` was cached: refreshing it closes this sheet, and then
  // the auth sheet opens, which brings the guest back to this trip.
  useEffect(() => {
    if (isUnauthorized) {
      void queryClient
        .invalidateQueries({ queryKey: meQueryOptions().queryKey })
        .then(() => openAuthSheet(buildTripHref(bookingId)));
    }
  }, [isUnauthorized, queryClient, openAuthSheet, bookingId]);

  const booking = bookingQuery.data?.booking ?? null;
  const remainingToday = messagesQuery.data?.remainingToday ?? null;
  const isSending = sendMessage.isPending;
  const isLimitReached = isDailyLimitReached({
    remainingToday,
    sendErrorKind: sendError?.kind ?? null,
    chatUpdatedAt: messagesQuery.dataUpdatedAt,
    sendSubmittedAt: sendMessage.submittedAt,
  });
  const inlineError =
    sendError && !HANDLED_ELSEWHERE.has(sendError.kind) ? sendError : null;

  const retryLoad = () => {
    if (bookingQuery.isError) {
      void bookingQuery.refetch();
    }

    if (messagesQuery.isError) {
      void messagesQuery.refetch();
    }
  };

  const renderBody = () => {
    // Messages are always stale, so every focus refetches them: a failed refetch keeps the
    // loaded thread, and the error screen is only for a chat that never loaded.
    const isLoadingError =
      bookingQuery.isLoadingError || messagesQuery.isLoadingError;

    if (isLoadingError && loadError && !HANDLED_ELSEWHERE.has(loadError.kind)) {
      return (
        <StateMessage
          tone="error"
          icon={<CircleAlert />}
          title="We couldn't open this chat"
          description="Check your connection and try again."
          action={
            <Button type="button" className="h-11 w-full" onClick={retryLoad}>
              Retry
            </Button>
          }
        />
      );
    }

    if (!messagesQuery.data) {
      return <ChatThreadSkeleton />;
    }

    return (
      <ChatThread
        hotelName={booking?.hotel.name ?? null}
        messages={messagesQuery.data.messages}
        pendingQuestion={isSending ? sendMessage.variables.content : null}
      />
    );
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
      <DrawerHeader className="flex-row items-start gap-3 border-b px-4 pt-2 pb-3 text-left group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <DrawerTitle className="text-lg leading-snug wrap-break-word">
            {booking?.hotel.name ?? 'Guest Hub'}
          </DrawerTitle>
          {booking ? (
            <p className="text-sm">
              {formatDateRange({
                checkin: booking.checkin,
                checkout: booking.checkout,
              })}
            </p>
          ) : (
            <Skeleton aria-hidden className="h-4 w-40" />
          )}
          <DrawerDescription>Ask about your stay</DrawerDescription>
        </div>
        <DrawerClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close"
            className="-mr-2 size-11 shrink-0"
          >
            <X aria-hidden className="size-5" />
          </Button>
        </DrawerClose>
      </DrawerHeader>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4">
        {renderBody()}
      </div>
      {messagesQuery.data && (
        <div className="flex flex-col gap-2 border-t px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          {inlineError && (
            <p role="alert" className="text-sm text-destructive">
              {inlineError.message}
            </p>
          )}
          <ChatComposer
            disabled={isSending || isLimitReached}
            onSend={content => sendMessage.mutateAsync({ content })}
          />
          {isLimitReached ? (
            <p role="status" className="text-center text-sm">
              <span className="font-semibold">{DAILY_LIMIT_MESSAGE}</span>
              <span className="text-muted-foreground">
                . You can ask more questions tomorrow.
              </span>
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              {describeRemaining(remainingToday ?? 0)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
