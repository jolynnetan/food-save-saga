import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, languages, allTranslations, translate } from "@/lib/translations";

export type { Language };
export { languages };

type FontSize = "small" | "medium" | "large";
type Theme = "light" | "dark" | "eco";
type AppMode = "simple" | "advanced";

type SettingsContextType = {
  language: Language;
  setLanguage: (l: Language) => void;
  fontSize: FontSize;
  setFontSize: (f: FontSize) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  appMode: AppMode;
  setAppMode: (m: AppMode) => void;
  dashboardOrder: string[];
  setDashboardOrder: (o: string[]) => void;
};

const SettingsContext = createContext<SettingsContextType | null>(null);

const fontSizeMap: Record<FontSize, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

const DEFAULT_DASHBOARD_ORDER = ["stats", "missions", "calories-scan", "challenges", "achievements", "impact", "tools", "motivation", "tip"];

// Keep legacy export for backward compat
export const translations = allTranslations;

function applyThemeClass(theme: Theme) {
  const el = document.documentElement;
  el.classList.remove("dark", "eco");
  if (theme === "dark") el.classList.add("dark");
  if (theme === "eco") el.classList.add("eco");
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("sp-lang") as Language) || "en");
  const [fontSize, setFontSize] = useState<FontSize>(() => (localStorage.getItem("sp-fontsize") as FontSize) || "medium");
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("sp-theme") as Theme) || "light");
  const [appMode, setAppMode] = useState<AppMode>(() => (localStorage.getItem("sp-app-mode") as AppMode) || "advanced");
  const [dashboardOrder, setDashboardOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem("sp-dashboard-order");
    if (saved) try { return JSON.parse(saved); } catch {}
    return DEFAULT_DASHBOARD_ORDER;
  });

  useEffect(() => { localStorage.setItem("sp-lang", language); }, [language]);
  useEffect(() => {
    localStorage.setItem("sp-fontsize", fontSize);
    document.documentElement.style.fontSize = fontSizeMap[fontSize];
  }, [fontSize]);
  useEffect(() => {
    localStorage.setItem("sp-theme", theme);
    applyThemeClass(theme);
  }, [theme]);
  useEffect(() => { localStorage.setItem("sp-app-mode", appMode); }, [appMode]);
  useEffect(() => { localStorage.setItem("sp-dashboard-order", JSON.stringify(dashboardOrder)); }, [dashboardOrder]);

  return (
    <SettingsContext.Provider value={{ language, setLanguage, fontSize, setFontSize, theme, setTheme, appMode, setAppMode, dashboardOrder, setDashboardOrder }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

export function useT() {
  const { language } = useSettings();
  return (key: string, params?: Record<string, string | number>) => translate(language, key, params);
}
