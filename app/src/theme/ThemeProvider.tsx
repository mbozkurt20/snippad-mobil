import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  luxuryKeyboardThemes,
  KeyboardTheme,
  defaultTheme,
  getTheme,
} from './luxuryKeyboardThemes';
import { mmkvStorage } from '../store/storage';

interface ThemeContextType {
  currentTheme: KeyboardTheme;
  themeId: string;
  setTheme: (themeId: string) => void;
  isDarkMode: boolean;
  availableThemes: KeyboardTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'keyboard_theme_id';
const DEFAULT_THEME_ID = 'klasik';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';

  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [currentTheme, setCurrentTheme] = useState<KeyboardTheme>(defaultTheme);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved theme on mount (from MMKV storage + sync with native)
  useEffect(() => {
    const loadSavedTheme = async () => {
      try {
        const saved = mmkvStorage?.getKeyboardTheme?.();
        if (saved && getTheme(saved)) {
          setThemeId(saved);
          setCurrentTheme(getTheme(saved)!);
        } else {
          // Auto-select theme based on system color scheme if no saved preference
          const autoTheme = isDarkMode ? 'noir' : 'frost';
          setThemeId(autoTheme);
          setCurrentTheme(getTheme(autoTheme) || defaultTheme);
          // Save auto-selected theme
          mmkvStorage?.setKeyboardTheme?.(autoTheme);
        }
      } catch (e) {
        // Fallback to default
        setThemeId(DEFAULT_THEME_ID);
        setCurrentTheme(defaultTheme);
      } finally {
        setIsInitialized(true);
      }
    };

    loadSavedTheme();
  }, [isDarkMode]);

  const handleSetTheme = async (newThemeId: string) => {
    const theme = getTheme(newThemeId);
    if (theme) {
      setThemeId(newThemeId);
      setCurrentTheme(theme);

      // Persist to storage + sync with Native keyboard extension
      try {
        mmkvStorage?.setKeyboardTheme?.(newThemeId);
      } catch (e) {
        console.warn('Failed to save theme preference:', e);
      }
    }
  };

  const availableThemes = Object.values(luxuryKeyboardThemes);

  if (!isInitialized) {
    return null; // or a loading screen
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeId,
        setTheme: handleSetTheme,
        isDarkMode,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use keyboard theme anywhere in the app
 */
export function useKeyboardTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useKeyboardTheme must be used within ThemeProvider');
  }
  return context;
}

/**
 * Hook to get only the current theme
 */
export function useCurrentTheme(): KeyboardTheme {
  return useKeyboardTheme().currentTheme;
}

/**
 * Hook to get theme setter function
 */
export function useSetTheme(): (themeId: string) => void {
  return useKeyboardTheme().setTheme;
}

/**
 * Hook to check if dark mode is enabled
 */
export function useDarkMode(): boolean {
  return useKeyboardTheme().isDarkMode;
}
