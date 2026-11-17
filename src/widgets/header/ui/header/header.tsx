import Link from 'next/link';

import { ThemeToggle } from 'features/theme-toggle/ui/theme-toggle/theme-toggle';

export const Header = () => (
  <header className="flex items-center justify-between p-2">
    <Link href="/" className="font-semibold">
      Next.js Template
    </Link>
    <ThemeToggle />
  </header>
);
