"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  mounted: false,
});

// There is nothing to subscribe to: the answer flips once, when hydration ends.
const subscribe = () => () => {};

// Reads the saved choice, falling back to the system preference. Safe to call
// on the server, where neither is available.
function resolveInitialTheme() {
  if (typeof window === "undefined") return "light";

  try {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") return storedTheme;

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch (error) {
    return "light";
  }
}

export function ThemeProvider({ children }) {
  // The theme is resolved during the first render rather than inside an effect,
  // and "mounted" comes from useSyncExternalStore rather than an effect, so no
  // state is ever set synchronously from an effect. Nothing theme dependent
  // renders before hydration ends, which keeps the server and the first client
  // render identical.
  const [theme, setTheme] = useState(resolveInitialTheme);
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    // Keeps the document class in sync with the theme, on mount and on change.
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "light" ? "dark" : "light";

    setTheme(nextTheme);

    try {
      localStorage.setItem("theme", nextTheme);
    } catch (error) {
      // A blocked storage API must not stop the toggle from working.
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
