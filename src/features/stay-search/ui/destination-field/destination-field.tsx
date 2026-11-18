'use client';

import { ComponentProps, KeyboardEvent, Ref, useState } from 'react';

import { Loader2, MapPin } from 'lucide-react';

import {
  PLACE_QUERY_MAX_LENGTH,
  PLACE_QUERY_MIN_LENGTH,
  useSearchPlaces,
} from 'entities/places/hooks/get';
import type { IPlace } from 'entities/places/types/responses';
import { useDebouncedValue } from 'shared/hooks/use-debounced-value';
import { cn } from 'shared/lib/styles';
import { Input } from 'shared/ui/shadcn/input';

export type DestinationValue = { placeId: string; placeName: string };

type Props = {
  id: string;
  value: DestinationValue;
  onChange: (value: DestinationValue) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLInputElement>;
} & Pick<ComponentProps<'input'>, 'aria-invalid' | 'aria-describedby'>;

const TYPING_DEBOUNCE_MS = 300;
const MAX_SUGGESTIONS = 8;
const NO_ACTIVE_OPTION = -1;

const describeCount = (count: number) =>
  count === 1 ? '1 destination found' : `${count} destinations found`;

export const DestinationField = ({
  id,
  value,
  onChange,
  onBlur,
  ref,
  ...ariaProps
}: Props) => {
  const listboxId = `${id}-listbox`;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(NO_ACTIVE_OPTION);
  const debouncedQuery = useDebouncedValue(value.placeName, TYPING_DEBOUNCE_MS);
  // A closed list sends no request: after a pick the input holds the place name, which
  // would otherwise trigger one more search.
  const placesQuery = useSearchPlaces(isOpen ? debouncedQuery : '');
  const places = (placesQuery.data?.places ?? []).slice(0, MAX_SUGGESTIONS);
  const isPopupVisible =
    isOpen && value.placeName.trim().length >= PLACE_QUERY_MIN_LENGTH;
  const hasOptions = isPopupVisible && places.length > 0;
  const activePlace = hasOptions ? places[activeIndex] : undefined;
  const optionId = (index: number) => `${listboxId}-${index}`;

  const close = () => {
    setIsOpen(false);
    setActiveIndex(NO_ACTIVE_OPTION);
  };

  const pick = (place: IPlace) => {
    onChange({ placeId: place.placeId, placeName: place.name });
    close();
  };

  const moveActive = (step: number) => {
    setIsOpen(true);
    setActiveIndex(current =>
      Math.min(Math.max(current + step, 0), places.length - 1),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && places.length > 0) {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === 'ArrowUp' && places.length > 0) {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === 'Enter' && activePlace) {
      event.preventDefault();
      pick(activePlace);
    } else if (event.key === 'Escape' && isPopupVisible) {
      event.preventDefault();
      close();
    }
  };

  const renderStatus = () => {
    if (placesQuery.isError) {
      return "We couldn't load destinations. Keep typing to try again.";
    }

    if (placesQuery.isPending || debouncedQuery !== value.placeName) {
      return null;
    }

    return places.length === 0 ? 'No destinations found.' : null;
  };

  const status = isPopupVisible ? renderStatus() : null;
  const isSearching =
    isPopupVisible &&
    !placesQuery.isError &&
    (placesQuery.isFetching || debouncedQuery !== value.placeName);

  return (
    <div className="relative">
      <MapPin
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        ref={ref}
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={hasOptions}
        aria-controls={hasOptions ? listboxId : undefined}
        aria-activedescendant={activePlace ? optionId(activeIndex) : undefined}
        placeholder="City, region or landmark"
        autoComplete="off"
        maxLength={PLACE_QUERY_MAX_LENGTH}
        enterKeyHint="search"
        className="h-11 pr-10 pl-10"
        value={value.placeName}
        onChange={event => {
          onChange({ placeId: '', placeName: event.target.value });
          setIsOpen(true);
          setActiveIndex(NO_ACTIVE_OPTION);
        }}
        onFocus={() => setIsOpen(!value.placeId)}
        onBlur={() => {
          close();
          onBlur?.();
        }}
        onKeyDown={handleKeyDown}
        {...ariaProps}
      />
      {isSearching && (
        <Loader2
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 animate-spin text-muted-foreground"
        />
      )}
      <span role="status" className="sr-only">
        {hasOptions ? describeCount(places.length) : (status ?? '')}
      </span>
      {(hasOptions || status) && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-card">
          {hasOptions ? (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Destinations"
              className="flex flex-col py-1"
            >
              {places.map((place, index) => (
                <li
                  key={place.placeId}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={cn(
                    'flex min-h-11 cursor-pointer flex-col justify-center px-4 py-2',
                    index === activeIndex && 'bg-secondary',
                  )}
                  // Keeps focus in the input, so its blur does not close the list
                  // before the click lands.
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => pick(place)}
                >
                  <span className="truncate text-sm font-medium">
                    {place.name}
                  </span>
                  {place.address && (
                    <span className="truncate text-xs text-muted-foreground">
                      {place.address}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p aria-hidden className="px-4 py-3 text-sm text-muted-foreground">
              {status}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
