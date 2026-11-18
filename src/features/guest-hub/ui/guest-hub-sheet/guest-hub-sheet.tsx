'use client';

import { useCallback, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMe } from 'entities/auth/hooks/get';
import { TRIPS_PATH } from 'shared/lib/routes/routes';
import { Drawer, DrawerContent } from 'shared/ui/shadcn/drawer';

import { GuestHubChat } from '../guest-hub-chat/guest-hub-chat';

type Props = {
  bookingId: string | null;
};

export const GuestHubSheet = ({ bookingId }: Props) => {
  const router = useRouter();
  const me = useMe();
  // The last opened trip stays rendered while the sheet slides away, so the closing
  // sheet is not blank.
  const [shownId, setShownId] = useState(bookingId);
  const [previousId, setPreviousId] = useState(bookingId);
  // Closing hides the sheet at once instead of waiting for the URL change to round-trip.
  const [isDismissed, setIsDismissed] = useState(false);

  if (bookingId !== previousId) {
    setPreviousId(bookingId);
    setIsDismissed(false);

    if (bookingId) {
      setShownId(bookingId);
    }
  }

  // Signed out, the Trips page owns the auth sheet; two sheets would fight for focus.
  const isOpen = Boolean(me.data) && bookingId !== null && !isDismissed;

  const close = useCallback(() => {
    setIsDismissed(true);
    router.replace(TRIPS_PATH, { scroll: false });
  }, [router]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent className="data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:h-[96dvh] data-[vaul-drawer-direction=bottom]:max-h-[96dvh]">
        {shownId && (
          <GuestHubChat key={shownId} bookingId={shownId} onClose={close} />
        )}
      </DrawerContent>
    </Drawer>
  );
};
