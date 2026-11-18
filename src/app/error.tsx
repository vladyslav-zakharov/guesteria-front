// Next requires error boundaries to be Client Components, unlike pages and layouts.
'use client';

import { CircleAlert } from 'lucide-react';

import { Button } from 'shared/ui/shadcn/button';
import { StateMessage } from 'shared/ui/state-message';

type Props = {
  error: unknown;
  retry: () => void;
};

const ErrorPage = ({ retry }: Props) => (
  <div className="px-4 pt-4">
    <StateMessage
      tone="error"
      titleAs="h1"
      icon={<CircleAlert />}
      title="Something went wrong"
      description="The page could not load. Try again in a moment."
      action={
        <Button type="button" className="min-h-11 w-full" onClick={retry}>
          Try again
        </Button>
      }
    />
  </div>
);

export default ErrorPage;
