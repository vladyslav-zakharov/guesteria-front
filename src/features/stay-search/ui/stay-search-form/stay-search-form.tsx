'use client';

import { useId } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';

import {
  buildStaySchema,
  serializeStayParams,
  type StayParams,
} from 'shared/lib/stay/stay-params';
import { DateRangePicker } from 'shared/ui/date-range-picker';
import { GuestPicker } from 'shared/ui/guest-picker';
import { Button } from 'shared/ui/shadcn/button';
import { Card, CardContent } from 'shared/ui/shadcn/card';
import { Label } from 'shared/ui/shadcn/label';

import { DestinationField } from '../destination-field/destination-field';

const DEFAULT_ADULTS = 2;

type FieldErrorProps = {
  id: string;
  message?: string;
};

const FieldError = ({ id, message }: FieldErrorProps) =>
  message ? (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  ) : null;

type Props = {
  prefill: Partial<StayParams>;
  // The UTC calendar day from the server, the same day the back validates stays against.
  today: string;
};

export const StaySearchForm = ({ prefill, today }: Props) => {
  const router = useRouter();
  const fieldId = useId();
  const form = useForm({
    resolver: zodResolver(buildStaySchema(today)),
    defaultValues: {
      placeId: prefill.placeName ? (prefill.placeId ?? '') : '',
      placeName: prefill.placeName ?? '',
      checkin: prefill.checkin ?? '',
      checkout: prefill.checkout ?? '',
      adults: prefill.adults ?? DEFAULT_ADULTS,
      children: prefill.children ?? [],
    },
  });
  const [placeId, checkout, children] = useWatch({
    control: form.control,
    name: ['placeId', 'checkout', 'children'],
  });
  const { errors, isSubmitted } = form.formState;
  const destinationError = errors.placeName?.message ?? errors.placeId?.message;
  const datesError = errors.checkin?.message ?? errors.checkout?.message;
  const guestsError = errors.adults?.message ?? errors.children?.message;
  const ids = {
    destination: `${fieldId}-destination`,
    destinationError: `${fieldId}-destination-error`,
    dates: `${fieldId}-dates`,
    datesLabel: `${fieldId}-dates-label`,
    datesError: `${fieldId}-dates-error`,
    guests: `${fieldId}-guests`,
    guestsLabel: `${fieldId}-guests-label`,
    guestsError: `${fieldId}-guests-error`,
  };

  const handleSubmit = form.handleSubmit(values =>
    router.push(`/search?${serializeStayParams(values)}`),
  );

  return (
    <section
      aria-labelledby={`${fieldId}-title`}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <h1
          id={`${fieldId}-title`}
          className="text-display font-extrabold tracking-tight"
        >
          Find your next stay
        </h1>
        <p className="text-base text-muted-foreground">
          Compare hotels and book in a few taps.
        </p>
      </div>
      <Card className="shadow-card">
        <CardContent>
          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor={ids.destination}>Destination</Label>
              <Controller
                control={form.control}
                name="placeName"
                render={({ field }) => (
                  <DestinationField
                    ref={field.ref}
                    id={ids.destination}
                    aria-invalid={Boolean(destinationError)}
                    aria-describedby={
                      destinationError ? ids.destinationError : undefined
                    }
                    value={{ placeId, placeName: field.value }}
                    onBlur={field.onBlur}
                    onChange={destination => {
                      field.onChange(destination.placeName);
                      form.setValue('placeId', destination.placeId, {
                        shouldValidate: isSubmitted,
                      });
                    }}
                  />
                )}
              />
              <FieldError
                id={ids.destinationError}
                message={destinationError}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label id={ids.datesLabel} htmlFor={ids.dates}>
                Dates
              </Label>
              <Controller
                control={form.control}
                name="checkin"
                render={({ field }) => (
                  <DateRangePicker
                    id={ids.dates}
                    labelId={ids.datesLabel}
                    today={today}
                    aria-invalid={Boolean(datesError)}
                    aria-describedby={datesError ? ids.datesError : undefined}
                    value={{
                      checkin: field.value || null,
                      checkout: checkout || null,
                    }}
                    onChange={range => {
                      field.onChange(range.checkin ?? '');
                      form.setValue('checkout', range.checkout ?? '', {
                        shouldValidate: isSubmitted,
                      });
                    }}
                  />
                )}
              />
              <FieldError id={ids.datesError} message={datesError} />
            </div>
            <div className="flex flex-col gap-2">
              <Label id={ids.guestsLabel} htmlFor={ids.guests}>
                Guests
              </Label>
              <Controller
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <GuestPicker
                    id={ids.guests}
                    labelId={ids.guestsLabel}
                    aria-invalid={Boolean(guestsError)}
                    aria-describedby={guestsError ? ids.guestsError : undefined}
                    value={{
                      adults: field.value,
                      children,
                    }}
                    onChange={guests => {
                      field.onChange(guests.adults);
                      form.setValue('children', guests.children, {
                        shouldValidate: isSubmitted,
                      });
                    }}
                  />
                )}
              />
              <FieldError id={ids.guestsError} message={guestsError} />
            </div>
            <Button
              type="submit"
              size="lg"
              className="mt-2 min-h-12 w-full text-base"
            >
              Search
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};
