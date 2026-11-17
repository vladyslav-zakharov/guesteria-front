// Next requires error boundaries to be Client Components, unlike pages and layouts.
'use client';

import { Button } from 'shared/ui/button/button';

type Props = {
  error: unknown;
  retry: () => void;
};

const ErrorPage = ({ retry }: Props) => (
  <main className="flex flex-col items-start gap-4 p-2">
    <h1 className="text-2xl font-semibold">Something went wrong</h1>
    <p>The page could not load. Try again in a moment.</p>
    <Button onClick={retry}>Try again</Button>
  </main>
);

export default ErrorPage;
