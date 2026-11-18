'use client';

import { useRouter } from 'next/navigation';

import { CircleAlert, UserRound } from 'lucide-react';
import { toast } from 'sonner';

import { useMe } from 'entities/auth/hooks/get';
import { useSignOut } from 'entities/auth/hooks/post';
import { IUser } from 'entities/auth/types/responses';
import { restoreFocus } from 'shared/lib/focus';
import { useAccountSheetStore } from 'shared/store/account-sheet';
import { useAuthSheetStore } from 'shared/store/auth-sheet';
import { Avatar, AvatarFallback } from 'shared/ui/shadcn/avatar';
import { Button } from 'shared/ui/shadcn/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from 'shared/ui/shadcn/drawer';
import { Skeleton } from 'shared/ui/shadcn/skeleton';
import { StateMessage } from 'shared/ui/state-message';

const getInitials = ({ firstName, lastName }: IUser) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export const AccountSheet = () => {
  const router = useRouter();
  const isOpen = useAccountSheetStore(state => state.isOpen);
  const close = useAccountSheetStore(state => state.close);
  const returnFocusTo = useAccountSheetStore(state => state.returnFocusTo);
  const isAuthSheetOpen = useAuthSheetStore(state => state.isOpen);
  const openAuthSheet = useAuthSheetStore(state => state.open);
  const me = useMe();
  const signOut = useSignOut();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
    }
  };

  // The auth sheet replaces this one, so it hands focus back to the control that opened
  // this sheet: the Sign in button is gone by then.
  const handleSignIn = () => {
    close();
    openAuthSheet(undefined, returnFocusTo);
  };

  const handleCloseAutoFocus = (event: Event) => {
    // The auth sheet opened in its place and holds focus; moving it back here would pull
    // it out of the open sheet.
    if (isAuthSheetOpen) {
      event.preventDefault();

      return;
    }

    restoreFocus({ event, target: returnFocusTo });
  };

  const handleSignOut = () =>
    signOut.mutate(undefined, {
      onSuccess: () => {
        close();
        router.push('/');
      },
      onError: () => {
        toast.error('Could not sign out. Try again.');
      },
    });

  const renderBody = () => {
    if (me.isPending) {
      return (
        <div
          role="status"
          aria-label="Loading your account"
          className="flex items-center gap-3 py-2"
        >
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      );
    }

    if (me.isError) {
      return (
        <StateMessage
          tone="error"
          icon={<CircleAlert />}
          title="We could not load your account"
          description="Check your connection and try again."
          action={
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full"
              onClick={() => void me.refetch()}
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
          icon={<UserRound />}
          title="You are not signed in"
          description="Sign in to book a stay and see your trips."
          action={
            <Button
              type="button"
              className="min-h-11 w-full"
              onClick={handleSignIn}
            >
              Sign in
            </Button>
          }
        />
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
              {getInitials(me.data)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-base font-semibold">
              {me.data.firstName} {me.data.lastName}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {me.data.email}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full"
          disabled={signOut.isPending}
          onClick={handleSignOut}
        >
          {signOut.isPending ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent onCloseAutoFocus={handleCloseAutoFocus}>
        <div className="mx-auto flex w-full max-w-md flex-col pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <DrawerHeader>
            <DrawerTitle className="text-xl">Account</DrawerTitle>
            <DrawerDescription>Your StayHub profile.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{renderBody()}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
