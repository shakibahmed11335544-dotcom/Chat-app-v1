import React, { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preferences = useQuery(api.preferences.getUserPreferences);
  const updatePreferences = useMutation(api.preferences.updatePreferences);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Auto-detect system preference on first load
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (preferences) {
      setIsDark(preferences.darkMode);
    } else {
      setIsDark(systemPrefersDark);
    }
  }, [preferences]);

  useEffect(() => {
    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await updatePreferences({ darkMode: newTheme });
    } catch (error) {
      console.error("Failed to update theme preference:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
