'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Luggage, Search, UserRound, type LucideIcon } from 'lucide-react';

import { cn } from 'shared/lib/styles';
import { useAccountSheetStore } from 'shared/store/account-sheet';

type NavLink = {
  href: string;
  label: string;
  Icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const NAV_LINKS: NavLink[] = [
  {
    href: '/',
    label: 'Search',
    Icon: Search,
    isActive: pathname =>
      pathname === '/' ||
      pathname.startsWith('/search') ||
      pathname.startsWith('/hotels'),
  },
  {
    href: '/trips',
    label: 'Trips',
    Icon: Luggage,
    isActive: pathname => pathname.startsWith('/trips'),
  },
];

const ITEM_CLASS =
  'flex min-h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground outline-none transition-colors focus-visible:bg-secondary focus-visible:text-secondary-foreground';

export const BottomNav = () => {
  const pathname = usePathname();
  const isAccountOpen = useAccountSheetStore(state => state.isOpen);
  const openAccount = useAccountSheetStore(state => state.open);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {NAV_LINKS.map(({ href, label, Icon, isActive }) => {
          const active = isActive(pathname);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(ITEM_CLASS, active && 'text-primary')}
              >
                <Icon aria-hidden className="size-6" />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isAccountOpen}
            onClick={event => openAccount(event.currentTarget)}
            className={cn(
              ITEM_CLASS,
              'cursor-pointer',
              isAccountOpen && 'text-primary',
            )}
          >
            <UserRound aria-hidden className="size-6" />
            Account
          </button>
        </li>
      </ul>
    </nav>
  );
};
