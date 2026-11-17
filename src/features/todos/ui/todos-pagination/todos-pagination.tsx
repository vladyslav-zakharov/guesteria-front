import { FC } from 'react';

import Link from 'next/link';

interface IProps {
  page: number;
  hasNextPage: boolean;
}

const linkClassName =
  'rounded-sm px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-500';

// An unavailable step stays visible so the layout does not shift, but screen readers skip it.
const unavailableClassName = 'px-3 py-1 opacity-50';

export const TodosPagination: FC<IProps> = ({ page, hasNextPage }) => (
  <nav aria-label="Todos pages" className="flex items-center gap-2">
    {page > 1 ? (
      <Link href={`?page=${page - 1}`} className={linkClassName}>
        Previous
      </Link>
    ) : (
      <span aria-hidden className={unavailableClassName}>
        Previous
      </span>
    )}
    <span>Page {page}</span>
    {hasNextPage ? (
      <Link href={`?page=${page + 1}`} className={linkClassName}>
        Next
      </Link>
    ) : (
      <span aria-hidden className={unavailableClassName}>
        Next
      </span>
    )}
  </nav>
);
