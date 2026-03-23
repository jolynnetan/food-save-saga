import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ms" | "zh" | "ta";
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

export const languages: Record<Language, { label: string; flag: string }> = {
  en: { label: "English", flag: "🇬🇧" },
  ms: { label: "Bahasa Melayu", flag: "🇲🇾" },
  zh: { label: "中文", flag: "🇨🇳" },
  ta: { label: "தமிழ்", flag: "🇮🇳" },
};

export const translations: Record<Language, Record<string, string>> = {
  en: {
    settings: "Settings",
    settingsDesc: "Customize your experience",
    language: "Language",
    fontSize: "Font Size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    darkMode: "Dark Mode",
    darkModeDesc: "Switch to dark theme",
    friends: "Friends",
    friendsDesc: "Track your friends' progress",
    appearance: "Appearance",
    general: "General",
    viewFriends: "View Friends",
  },
  ms: {
    settings: "Tetapan",
    settingsDesc: "Sesuaikan pengalaman anda",
    language: "Bahasa",
    fontSize: "Saiz Font",
    small: "Kecil",
    medium: "Sederhana",
    large: "Besar",
    darkMode: "Mod Gelap",
    darkModeDesc: "Tukar ke tema gelap",
    friends: "Rakan",
    friendsDesc: "Jejaki kemajuan rakan anda",
    appearance: "Penampilan",
    general: "Umum",
    viewFriends: "Lihat Rakan",
  },
  zh: {
    settings: "设置",
    settingsDesc: "自定义您的体验",
    language: "语言",
    fontSize: "字体大小",
    small: "小",
    medium: "中",
    large: "大",
    darkMode: "深色模式",
    darkModeDesc: "切换到深色主题",
    friends: "好友",
    friendsDesc: "追踪好友的进展",
    appearance: "外观",
    general: "通用",
    viewFriends: "查看好友",
  },
  ta: {
    settings: "அமைப்புகள்",
    settingsDesc: "உங்கள் அனுபவத்தை தனிப்பயனாக்கவும்",
    language: "மொழி",
    fontSize: "எழுத்துரு அளவு",
    small: "சிறிய",
    medium: "நடுத்தர",
    large: "பெரிய",
    darkMode: "இருண்ட பயன்முறை",
    darkModeDesc: "இருண்ட தீம்க்கு மாறவும்",
    friends: "நண்பர்கள்",
    friendsDesc: "உங்கள் நண்பர்களின் முன்னேற்றத்தை கண்காணிக்கவும்",
    appearance: "தோற்றம்",
    general: "பொது",
    viewFriends: "நண்பர்களைக் காண",
  },
};

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
  return (key: string) => translations[language]?.[key] ?? translations.en[key] ?? key;
}
