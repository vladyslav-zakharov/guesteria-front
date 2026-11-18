'use client';

import { ComponentProps, useId } from 'react';

import { CalendarDays } from 'lucide-react';
import type { DateRange, Matcher } from 'react-day-picker';

import { STAY_LIMITS } from 'shared/constants/stay';
import { describeNights } from 'shared/lib/format/describe-stay';
import {
  addDays,
  countNights,
  formatDateRange,
  formatStayDate,
  fromIsoDate,
  toIsoDate,
} from 'shared/lib/format/format';
import { cn } from 'shared/lib/styles';
import { Button } from 'shared/ui/shadcn/button';
import { Calendar } from 'shared/ui/shadcn/calendar';
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

export type DateRangeValue = {
  checkin: string | null;
  checkout: string | null;
};

type Props = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  today: string;
  // The visible field label. The trigger is named by it plus its summary, because a
  // <label> alone would replace the summary as the button's name.
  labelId?: string;
} & Pick<ComponentProps<'button'>, 'id' | 'aria-invalid' | 'aria-describedby'>;

const describeRange = ({ checkin, checkout }: DateRangeValue) => {
  if (checkin && checkout) {
    return `${formatDateRange({ checkin, checkout })} · ${describeNights(countNights({ checkin, checkout }))}`;
  }

  if (checkin) {
    return `${formatStayDate(checkin)} – add check-out`;
  }

  return null;
};

export const DateRangePicker = ({
  value,
  onChange,
  today,
  labelId,
  ...triggerProps
}: Props) => {
  const summaryId = useId();
  const todayDate = fromIsoDate(today);
  const lastCheckin = addDays({
    date: today,
    days: STAY_LIMITS.maxAdvanceDays,
  });
  const lastCheckout = addDays({
    date: lastCheckin,
    days: STAY_LIMITS.maxNights,
  });
  const checkinDate = value.checkin ? fromIsoDate(value.checkin) : undefined;
  const checkoutDate = value.checkout ? fromIsoDate(value.checkout) : undefined;
  const isPickingCheckout = Boolean(checkinDate) && !checkoutDate;
  const disabled: Matcher[] = [
    { before: todayDate },
    {
      after: fromIsoDate(
        isPickingCheckout && value.checkin
          ? addDays({ date: value.checkin, days: STAY_LIMITS.maxNights })
          : lastCheckin,
      ),
    },
  ];
  const summary = describeRange(value);

  const handleSelect = (range: DateRange | undefined) =>
    onChange({
      checkin: range?.from ? toIsoDate(range.from) : null,
      checkout: range?.to ? toIsoDate(range.to) : null,
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
          <CalendarDays aria-hidden className="size-5 text-muted-foreground" />
          <span
            id={summaryId}
            className={cn(!summary && 'text-muted-foreground')}
          >
            {summary ?? 'Add dates'}
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Select dates</DrawerTitle>
          <DrawerDescription>
            Pick check-in, then check-out. Stays can be up to{' '}
            {STAY_LIMITS.maxNights} nights.
          </DrawerDescription>
        </DrawerHeader>
        <Calendar
          mode="range"
          selected={{ from: checkinDate, to: checkoutDate }}
          onSelect={handleSelect}
          disabled={disabled}
          min={1}
          max={STAY_LIMITS.maxNights}
          resetOnSelect
          defaultMonth={checkinDate ?? todayDate}
          startMonth={todayDate}
          endMonth={fromIsoDate(lastCheckout)}
          className="mx-auto [--cell-size:--spacing(11)]"
        />
        <DrawerFooter className="pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <p aria-live="polite" className="text-center text-sm font-medium">
            {summary ?? 'No dates selected'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={!checkinDate}
              onClick={() => onChange({ checkin: null, checkout: null })}
            >
              Clear
            </Button>
            <DrawerClose asChild>
              <Button type="button" className="min-h-11">
                Done
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
