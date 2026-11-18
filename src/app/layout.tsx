import { ReactNode } from 'react';

import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

import { BottomNav } from 'widgets/app-shell/ui/bottom-nav/bottom-nav';
import { AccountSheet } from 'features/account/ui/account-sheet/account-sheet';
import { AuthSheet } from 'features/auth/ui/auth-sheet/auth-sheet';
import { TanStackQueryProvider } from 'shared/providers/tanstack-query';
import { Toaster } from 'shared/ui/shadcn/sonner';

import 'app/styles/global.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: {
    default: 'StayHub',
    template: '%s | StayHub',
  },
  description: 'Search hotels, compare rooms and book your stay.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

type Props = {
  children: ReactNode;
};

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <TanStackQueryProvider>
          <main className="mx-auto w-full max-w-md pb-safe">{children}</main>
          <BottomNav />
          <AuthSheet />
          <AccountSheet />
          <Toaster />
        </TanStackQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
