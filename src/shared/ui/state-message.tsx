import { ReactNode } from 'react';

import { cn } from 'shared/lib/styles';

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  tone?: 'neutral' | 'error';
  className?: string;
  // `h1` when the message is the whole page, so screen-reader heading navigation finds it.
  titleAs?: 'p' | 'h1' | 'h2';
};

export const StateMessage = ({
  title,
  description,
  icon,
  action,
  tone = 'neutral',
  className,
  titleAs: Title = 'p',
}: Props) => (
  <div
    role={tone === 'error' ? 'alert' : 'status'}
    className={cn(
      'flex flex-col items-center gap-3 px-4 py-8 text-center',
      className,
    )}
  >
    {icon && (
      <span
        aria-hidden
        className={cn(
          'flex size-12 items-center justify-center rounded-full [&_svg]:size-6',
          tone === 'error'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-secondary text-secondary-foreground',
        )}
      >
        {icon}
      </span>
    )}
    <div className="flex flex-col gap-1">
      <Title className="text-base font-semibold">{title}</Title>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
    {action}
  </div>
);
