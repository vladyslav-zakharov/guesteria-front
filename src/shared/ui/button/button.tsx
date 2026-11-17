import { ComponentProps } from 'react';

import { cn } from 'shared/lib/styles';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-500',
};

interface IProps extends ComponentProps<'button'> {
  variant?: keyof typeof variants;
}

export const Button = ({
  type,
  variant = 'primary',
  className,
  ...props
}: IProps) => (
  <button
    // react/button-has-type checks only a literal or a ternary of literals, so the prop is
    // narrowed here instead of passed through.
    type={type === 'submit' ? 'submit' : 'button'}
    className={cn(
      'cursor-pointer rounded-sm px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      variants[variant],
      className,
    )}
    {...props}
  />
);
