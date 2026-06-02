import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('mp_theme');
    if (saved) return saved === 'dark';
    return false; // Default to premium Light Mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('mp_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mp_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return context;
};
