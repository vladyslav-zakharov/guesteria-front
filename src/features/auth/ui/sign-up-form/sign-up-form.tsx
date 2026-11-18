'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useSignUp } from 'entities/auth/hooks/post';
import { Button } from 'shared/ui/shadcn/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'shared/ui/shadcn/form';
import { Input } from 'shared/ui/shadcn/input';

import { getAuthErrorMessage } from '../../lib/auth-error-message';
import { signUpSchema } from '../../schemas/auth';

type Props = {
  onSuccess: () => void;
};

export const SignUpForm = ({ onSuccess }: Props) => {
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', firstName: '', lastName: '' },
  });
  const signUp = useSignUp();

  const handleSubmit = form.handleSubmit(values =>
    signUp.mutate(values, { onSuccess }),
  );

  return (
    <Form {...form}>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="given-name"
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
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="family-name"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
                  autoComplete="new-password"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormDescription>8 to 72 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {signUp.isError && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {getAuthErrorMessage(signUp.error)}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="min-h-11 w-full"
          disabled={signUp.isPending}
        >
          {signUp.isPending ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </Form>
  );
};
