import { ReactNode, useEffect, useRef } from 'react';

import Link from 'next/link';

import { CircleAlert, CircleCheck, Loader2, TriangleAlert } from 'lucide-react';

import { formatMoney } from 'shared/lib/format/format';
import { cn } from 'shared/lib/styles';
import { Button } from 'shared/ui/shadcn/button';
import { Drawer, DrawerContent, DrawerTitle } from 'shared/ui/shadcn/drawer';

import type { CheckoutState } from '../../lib/checkout-state';

type Props = {
  state: Exclude<CheckoutState, { status: 'idle' }>;
  hotelHref: string;
  onConfirmPrice: () => void;
  onRetry: () => void;
};

const ACTION_CLASS = 'h-12 w-full text-base';

type PanelProps = {
  icon: ReactNode;
  title: string;
  tone?: 'neutral' | 'error' | 'success';
  busy?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
};

const ICON_TONE = {
  neutral: 'bg-secondary text-secondary-foreground',
  error: 'bg-destructive/10 text-destructive',
  success: 'bg-success/10 text-success',
} as const;

// A modal sheet over the form and the bottom nav: the guest waits for the provider (a
// prebook can take a minute) or decides. The sheet traps focus and hides the page from
// assistive tech, and it cannot be swiped or escaped away, so nothing behind it can be
// submitted twice or left mid-booking.
const StatusPanel = ({
  icon,
  title,
  tone = 'neutral',
  busy = false,
  children,
  actions,
}: PanelProps) => {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Every step change moves focus to its title, so a screen reader announces the new step.
  // On the first step the title is not mounted yet (the portal renders a pass later), so
  // the open itself focuses it below.
  useEffect(() => {
    headingRef.current?.focus();
  }, [title]);

  // vaul skips the dialog's initial focus by default, which leaves focus on <body>
  // behind the now aria-hidden page.
  const focusTitle = (event: Event) => {
    event.preventDefault();
    headingRef.current?.focus();
  };

  return (
    <Drawer open dismissible={false}>
      {/* The drag handle promises a swipe that a non-dismissible sheet ignores. It is the
          content's first child, and its own direction rule outranks a plain class, hence
          the important modifier. */}
      <DrawerContent
        aria-describedby={undefined}
        aria-busy={busy}
        className="[&>div:first-child]:hidden!"
        onOpenAutoFocus={focusTitle}
      >
        <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 overflow-y-auto px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] text-center">
          <span
            aria-hidden
            className={cn(
              'flex size-14 items-center justify-center rounded-full [&_svg]:size-7',
              ICON_TONE[tone],
            )}
          >
            {icon}
          </span>
          <DrawerTitle
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-semibold outline-none"
          >
            {title}
          </DrawerTitle>
          {children}
          {actions && (
            <div className="flex w-full flex-col gap-2">{actions}</div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

const BackToHotel = ({
  href,
  primary = false,
}: {
  href: string;
  primary?: boolean;
}) => (
  <Button
    asChild
    variant={primary ? 'default' : 'outline'}
    className={ACTION_CLASS}
  >
    <Link href={href}>Back to hotel</Link>
  </Button>
);

export const CheckoutStatus = ({
  state,
  hotelHref,
  onConfirmPrice,
  onRetry,
}: Props) => {
  switch (state.status) {
    case 'prebooking':
      return (
        <StatusPanel
          busy
          icon={<Loader2 className="animate-spin motion-reduce:animate-none" />}
          title="Confirming your price…"
        >
          <p role="status" className="text-sm text-muted-foreground">
            We are checking the room with the hotel. This can take up to a
            minute, so keep this page open.
          </p>
        </StatusPanel>
      );

    case 'priceChanged':
      return (
        <StatusPanel
          icon={<TriangleAlert />}
          title={
            state.previousPrice ? 'The price has changed' : 'Confirm your price'
          }
          actions={
            <>
              <Button
                type="button"
                className={ACTION_CLASS}
                onClick={onConfirmPrice}
              >
                {state.previousPrice ? 'Confirm new price' : 'Confirm and book'}
              </Button>
              <BackToHotel href={hotelHref} />
            </>
          }
        >
          <div className="flex flex-col items-center gap-1">
            {state.previousPrice && (
              <p className="text-sm text-muted-foreground">
                <span className="sr-only">Previous price: </span>
                <s>{formatMoney(state.previousPrice)}</s>
              </p>
            )}
            <p className="text-2xl font-bold tabular-nums">
              <span className="sr-only">
                {state.previousPrice ? 'New price: ' : 'Price: '}
              </span>
              {formatMoney(state.prebook.price)}
            </p>
            <p className="text-sm text-muted-foreground">
              {`${state.prebook.roomName}, ${state.prebook.boardName}`}
            </p>
          </div>
        </StatusPanel>
      );

    case 'booking':
      return (
        <StatusPanel
          busy
          icon={<Loader2 className="animate-spin motion-reduce:animate-none" />}
          title="Booking your stay…"
        >
          <p role="status" className="text-sm text-muted-foreground">
            Your price is confirmed. Keep this page open while the hotel
            confirms your booking.
          </p>
        </StatusPanel>
      );

    case 'done':
      return (
        <StatusPanel
          busy
          tone="success"
          icon={<CircleCheck />}
          title="Booking confirmed"
        >
          <p role="status" className="text-sm text-muted-foreground">
            Opening your trip…
          </p>
        </StatusPanel>
      );

    case 'failed':
      return (
        <StatusPanel
          tone="error"
          icon={<CircleAlert />}
          title={state.failure.title}
          actions={
            <>
              {state.failure.checkTrips && (
                <Button asChild className={ACTION_CLASS}>
                  <Link href="/trips">Check Trips</Link>
                </Button>
              )}
              {state.failure.canRetry && (
                <Button
                  type="button"
                  className={ACTION_CLASS}
                  onClick={onRetry}
                >
                  Try again
                </Button>
              )}
              <BackToHotel
                href={hotelHref}
                primary={!state.failure.canRetry && !state.failure.checkTrips}
              />
            </>
          }
        >
          <p role="alert" className="text-sm text-muted-foreground">
            {state.failure.message}
          </p>
        </StatusPanel>
      );

    default:
      return null;
  }
};
