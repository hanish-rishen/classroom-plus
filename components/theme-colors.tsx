'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ColorTheme = 'pink' | 'blue' | 'green' | 'orange' | 'purple';

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('color-theme') as ColorTheme) || 'pink';
    }
    return 'pink';
  });

  const updateTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem('color-theme', theme);
    document.documentElement.style.setProperty('--primary', `var(--${theme})`);
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme: updateTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error('useColorTheme must be used within ColorThemeProvider');
  }
  return context;
}