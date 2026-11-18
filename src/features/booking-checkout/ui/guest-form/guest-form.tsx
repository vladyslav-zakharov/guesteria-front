import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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

import {
  guestFormSchema,
  SPECIAL_REQUESTS_MAX_LENGTH,
  type GuestDetails,
} from '../../schemas/guest-form';

type Props = {
  defaultValues: GuestDetails;
  onSubmit: (guest: GuestDetails) => void;
  isSubmitDisabled?: boolean;
};

const TEXTAREA_CLASS =
  'min-h-24 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm';

export const GuestForm = ({
  defaultValues,
  onSubmit,
  isSubmitDisabled = false,
}: Props) => {
  const form = useForm({
    resolver: zodResolver(guestFormSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form
        noValidate
        aria-labelledby="guest-form-title"
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <h2 id="guest-form-title" className="text-lg font-semibold">
          Guest details
        </h2>
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
              <FormDescription>
                The hotel sends the confirmation here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+44 20 7946 0958"
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
          name="specialRequests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special requests (optional)</FormLabel>
              <FormControl>
                <textarea
                  rows={3}
                  maxLength={SPECIAL_REQUESTS_MAX_LENGTH}
                  className={TEXTAREA_CLASS}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {`Up to ${SPECIAL_REQUESTS_MAX_LENGTH} characters. Requests depend on availability.`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-sm text-muted-foreground">
          No payment details are needed. This is a demo booking.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitDisabled}
          className="min-h-12 w-full text-base"
        >
          Book now
        </Button>
      </form>
    </Form>
  );
};
