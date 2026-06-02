"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Locale = "cs" | "en";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "cs",
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("cs");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("locale");
      if (stored === "cs" || stored === "en") {
        setLocaleState(stored);
      }
      // If invalid or null, keep default "cs"
    } catch {
      // localStorage unavailable (private browsing, etc.) — keep default
    }
    setMounted(true);
  }, []);

  // Keep <html lang> honest: the SSR default is "cs" (layout.tsx); once the
  // client-side locale is known/changed, reflect it on the document element.
  // Client-only effect → no SSR/hydration impact (E18; <html> already has
  // suppressHydrationWarning).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("locale", l);
    } catch {
      // localStorage unavailable — state update still works in memory
    }
  };

  // Before mount, render children wrapped in context with default "cs"
  // so useLocale() calls inside children always have context access
  if (!mounted) {
    return (
      <LocaleContext.Provider value={{ locale: "cs", setLocale }}>
        {children}
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
