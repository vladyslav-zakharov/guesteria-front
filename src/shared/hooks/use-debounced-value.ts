import { useEffect, useState } from 'react';

// Lets a search or filter input wait until the user stops typing, so a query keyed on the
// value refetches once instead of on every keystroke.
export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs);

    return () => clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
};
