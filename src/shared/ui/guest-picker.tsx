'use client';

import { ComponentProps, useId } from 'react';

import { Minus, Plus, UsersRound } from 'lucide-react';

import { STAY_LIMITS } from 'shared/constants/stay';
import { describeGuests, pluralize } from 'shared/lib/format/describe-stay';
import { cn } from 'shared/lib/styles';
import { Button } from 'shared/ui/shadcn/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from 'shared/ui/shadcn/drawer';
import { Separator } from 'shared/ui/shadcn/separator';

export type GuestsValue = { adults: number; children: number[] };

type Props = {
  value: GuestsValue;
  onChange: (value: GuestsValue) => void;
  // The visible field label. The trigger is named by it plus its summary, because a
  // <label> alone would replace the summary as the button's name.
  labelId?: string;
} & Pick<ComponentProps<'button'>, 'id' | 'aria-invalid' | 'aria-describedby'>;

type StepperProps = {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

const DEFAULT_CHILD_AGE = 0;
// A child has no identity beyond its position, so each age select is keyed by a fixed slot.
const CHILD_SLOTS = Array.from(
  { length: STAY_LIMITS.maxChildren },
  (_, slot) => slot,
);
const CHILD_AGES = Array.from(
  { length: STAY_LIMITS.maxChildAge + 1 },
  (_, age) => age,
);

const formatChildAge = (age: number) =>
  `${pluralize({ count: age, word: 'year' })} old`;

const Stepper = ({ label, hint, value, min, max, onChange }: StepperProps) => {
  const labelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="flex items-center justify-between gap-4 py-3"
    >
      <div className="flex flex-col">
        <span id={labelId} className="text-base font-medium">
          {label}
        </span>
        <span className="text-sm text-muted-foreground">{hint}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 rounded-full"
          aria-label={`Remove one from ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
        >
          <Minus aria-hidden />
        </Button>
        <output
          aria-live="polite"
          className="w-6 text-center text-base font-semibold tabular-nums"
        >
          {value}
        </output>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 rounded-full"
          aria-label={`Add one to ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
        >
          <Plus aria-hidden />
        </Button>
      </div>
    </div>
  );
};

export const GuestPicker = ({
  value,
  onChange,
  labelId,
  ...triggerProps
}: Props) => {
  const { adults, children } = value;
  const ageIdPrefix = useId();
  const summaryId = useId();

  const handleChildrenCount = (count: number) =>
    onChange({
      adults,
      children:
        count > children.length
          ? [...children, DEFAULT_CHILD_AGE]
          : children.slice(0, count),
    });

  const handleChildAge = ({ index, age }: { index: number; age: number }) =>
    onChange({
      adults,
      children: children.map((current, position) =>
        position === index ? age : current,
      ),
    });

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex min-h-11 w-full items-center gap-3 rounded-md border border-input bg-background px-3 py-2 text-left text-base shadow-xs outline-none',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
          )}
          aria-labelledby={labelId ? `${labelId} ${summaryId}` : undefined}
          {...triggerProps}
        >
          <UsersRound aria-hidden className="size-5 text-muted-foreground" />
          <span id={summaryId}>{describeGuests(value)}</span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Guests</DrawerTitle>
          <DrawerDescription>
            Up to {STAY_LIMITS.maxAdults} adults and {STAY_LIMITS.maxChildren}{' '}
            children per room.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col overflow-y-auto px-4">
          <Stepper
            label="Adults"
            hint="Age 18 or over"
            value={adults}
            min={STAY_LIMITS.minAdults}
            max={STAY_LIMITS.maxAdults}
            onChange={count => onChange({ adults: count, children })}
          />
          <Separator />
          <Stepper
            label="Children"
            hint={`Age 0 to ${STAY_LIMITS.maxChildAge}`}
            value={children.length}
            min={0}
            max={STAY_LIMITS.maxChildren}
            onChange={handleChildrenCount}
          />
          {children.length > 0 && (
            <ul className="flex flex-col gap-3 pb-2">
              {CHILD_SLOTS.slice(0, children.length).map(slot => (
                <li key={slot} className="flex flex-col gap-1">
                  <label
                    htmlFor={`${ageIdPrefix}-${slot}`}
                    className="text-sm font-medium"
                  >
                    Age of child {slot + 1}
                  </label>
                  <select
                    id={`${ageIdPrefix}-${slot}`}
                    value={children[slot]}
                    onChange={event =>
                      handleChildAge({
                        index: slot,
                        age: Number(event.target.value),
                      })
                    }
                    className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {CHILD_AGES.map(option => (
                      <option key={option} value={option}>
                        {formatChildAge(option)}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DrawerFooter className="pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <DrawerClose asChild>
            <Button type="button" className="min-h-11 w-full">
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
