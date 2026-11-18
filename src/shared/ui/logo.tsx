import LogoIcon from 'shared/icons/stayhub-logo.svg';
import { cn } from 'shared/lib/styles';

type Props = {
  className?: string;
};

export const Logo = ({ className }: Props) => (
  <span
    className={cn(
      'inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground',
      className,
    )}
  >
    <LogoIcon aria-hidden className="size-8 text-primary" />
    StayHub
  </span>
);
