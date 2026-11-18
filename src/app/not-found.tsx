import Link from 'next/link';

import { SearchX } from 'lucide-react';

import { Button } from 'shared/ui/shadcn/button';
import { StateMessage } from 'shared/ui/state-message';

const NotFoundPage = () => (
  <div className="px-4 pt-4">
    <StateMessage
      titleAs="h1"
      icon={<SearchX />}
      title="Page not found"
      description="This link is broken or the page no longer exists."
      action={
        <Button asChild className="min-h-11 w-full">
          <Link href="/">Back to search</Link>
        </Button>
      }
    />
  </div>
);

export default NotFoundPage;
