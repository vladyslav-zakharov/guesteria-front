import { create } from 'zustand';

import { getFocusedElement } from 'shared/lib/focus';

type AccountSheetState = {
  isOpen: boolean;
  // Kept after close: the sheet hands focus back only when its closing animation ends.
  returnFocusTo: HTMLElement | null;
  open: (returnFocusTo?: HTMLElement | null) => void;
  close: () => void;
};

export const useAccountSheetStore = create<AccountSheetState>()(set => ({
  isOpen: false,
  returnFocusTo: null,
  open: returnFocusTo =>
    set({ isOpen: true, returnFocusTo: returnFocusTo ?? getFocusedElement() }),
  close: () => set({ isOpen: false }),
}));
