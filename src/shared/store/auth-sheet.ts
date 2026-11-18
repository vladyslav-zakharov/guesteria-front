import { create } from 'zustand';

import { getFocusedElement } from 'shared/lib/focus';

type AuthSheetState = {
  isOpen: boolean;
  redirectTo: string | null;
  // Kept after close: the sheet hands focus back only when its closing animation ends.
  returnFocusTo: HTMLElement | null;
  open: (redirectTo?: string, returnFocusTo?: HTMLElement | null) => void;
  close: () => void;
};

export const useAuthSheetStore = create<AuthSheetState>()(set => ({
  isOpen: false,
  redirectTo: null,
  returnFocusTo: null,
  open: (redirectTo, returnFocusTo) =>
    set({
      isOpen: true,
      redirectTo: redirectTo ?? null,
      returnFocusTo: returnFocusTo ?? getFocusedElement(),
    }),
  close: () => set({ isOpen: false, redirectTo: null }),
}));
