import { useState } from 'react';

// Remembers, for the rest of the mount, that a condition held at least once.
export const useHasBeenTrue = (condition: boolean) => {
  const [hasBeenTrue, setHasBeenTrue] = useState(condition);

  if (condition && !hasBeenTrue) {
    setHasBeenTrue(true);
  }

  return hasBeenTrue || condition;
};
