'use client';

import MoonIcon from 'shared/icons/moon.svg';
import SunIcon from 'shared/icons/sun.svg';
import { Themes, useThemeStore } from 'shared/store/theme';
import { Button } from 'shared/ui/button/button';

export const ThemeToggle = () => {
  const theme = useThemeStore(state => state.theme);
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  const isDark = theme === Themes.dark;

  return (
    <Button
      variant="ghost"
      className="p-2"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    >
      {isDark ? (
        <SunIcon aria-hidden className="size-5" />
      ) : (
        <MoonIcon aria-hidden className="size-5" />
      )}
    </Button>
  );
};
