'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useSignIn } from 'entities/auth/hooks/post';
import { Button } from 'shared/ui/shadcn/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'shared/ui/shadcn/form';
import { Input } from 'shared/ui/shadcn/input';

import { getAuthErrorMessage } from '../../lib/auth-error-message';
import { signInSchema } from '../../schemas/auth';

type Props = {
  onSuccess: () => void;
};

export const SignInForm = ({ onSuccess }: Props) => {
  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  const signIn = useSignIn();

  const handleSubmit = form.handleSubmit(values =>
    signIn.mutate(values, { onSuccess }),
  );

  return (
    <Form {...form}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {signIn.isError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {getAuthErrorMessage(signIn.error)}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="min-h-11 w-full"
          disabled={signIn.isPending}
        >
          {signIn.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Form>
  );
};
