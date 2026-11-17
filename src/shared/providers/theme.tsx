'use client';

import { PropsWithChildren, useEffect } from 'react';

import { Themes, useThemeStore } from 'shared/store/theme';

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const theme = useThemeStore(state => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === Themes.dark);
  }, [theme]);

  return children;
};
