import { ReactNode } from 'react';

import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';

import { Header } from 'widgets/header/ui/header/header';
import { TanStackQueryProvider } from 'shared/providers/tanstack-query';
import { ThemeProvider } from 'shared/providers/theme';

import 'app/styles/global.css';

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-urbanist',
});

export const metadata: Metadata = {
  title: {
    default: 'Next.js Template',
    template: '%s | Next.js Template',
  },
  description: 'A Next.js App Router starter built on Feature-Sliced Design.',
};

type Props = {
  children: ReactNode;
};

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="en" className={urbanist.variable}>
      <body className="bg-white text-gray-600 transition-colors duration-1000 ease-in-out dark:bg-gray-600 dark:text-white">
        <TanStackQueryProvider>
          <ThemeProvider>
            <Header />
            {children}
          </ThemeProvider>
        </TanStackQueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
