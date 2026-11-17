import { create } from 'zustand';

export enum Themes {
  light = 'light',
  dark = 'dark',
}

const nextTheme: Record<Themes, Themes> = {
  [Themes.light]: Themes.dark,
  [Themes.dark]: Themes.light,
};

interface IThemeStore {
  theme: Themes;
  toggleTheme: () => void;
}

export const useThemeStore = create<IThemeStore>(set => ({
  // Not persisted, so every page load starts light. Persisting needs a cookie or an inline
  // script in <head>, or the page shows the wrong theme until hydration.
  theme: Themes.light,
  toggleTheme: () => set(state => ({ theme: nextTheme[state.theme] })),
}));
