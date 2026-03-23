import { Globe, Type, Moon, Sun, Users, ChevronRight, LogOut, Zap, Gamepad2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSettings, useT, languages } from "@/contexts/SettingsContext";
import { useGamification } from "@/contexts/GamificationContext";
import { useAuth } from "@/contexts/AuthContext";

type FontSize = "small" | "medium" | "large";

export default function Settings() {
  const { language, setLanguage, fontSize, setFontSize, theme, setTheme, appMode, setAppMode } = useSettings();
  const { signOut, user } = useAuth();
  const { gamificationEnabled, setGamificationEnabled } = useGamification();
  const navigate = useNavigate();
  const t = useT();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const fontSizes: { key: FontSize; label: string }[] = [
    { key: "small", label: t("small") },
    { key: "medium", label: t("medium") },
    { key: "large", label: t("large") },
  ];

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">{t("settings")}</h2>
        <p className="text-muted-foreground mt-1">{t("settingsDesc")}</p>
      </div>

      {/* General section */}
      <section className="space-y-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("general")}</h3>

        {/* Language */}
        <div className="bg-card border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-xl p-2.5">
              <Globe size={18} className="text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">{t("language")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(languages) as [string, { label: string; flag: string }][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setLanguage(key as any)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.95] ${
                  language === key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span>{val.flag}</span>
                <span>{val.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Friends link */}
        <Link
          to="/friends"
          className="flex items-center gap-3 bg-card border rounded-2xl p-4 transition-all duration-200 active:scale-[0.97]"
        >
          <div className="bg-warning/10 rounded-xl p-2.5">
            <Users size={18} className="text-warning" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{t("friends")}</p>
            <p className="text-xs text-muted-foreground">{t("friendsDesc")}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </Link>
      </section>

      {/* Appearance section */}
      <section className="space-y-3 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("appearance")}</h3>

        {/* Font size */}
        <div className="bg-card border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 rounded-xl p-2.5">
              <Type size={18} className="text-success" />
            </div>
            <span className="text-sm font-semibold text-foreground">{t("fontSize")}</span>
          </div>
          <div className="flex gap-2">
            {fontSizes.map((f) => (
              <button
                key={f.key}
                onClick={() => setFontSize(f.key)}
                className={`flex-1 text-center py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-[0.95] ${
                  fontSize === f.key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground"
                } ${f.key === "small" ? "text-xs" : f.key === "large" ? "text-base" : "text-sm"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {fontSize === "small" ? "Aa" : fontSize === "large" ? "Aa" : "Aa"} — Preview: The quick brown fox
          </p>
        </div>

        {/* Dark mode */}
        <div className="bg-card border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className={`${theme === "dark" ? "bg-accent/20" : "bg-warning/10"} rounded-xl p-2.5`}>
              {theme === "dark" ? <Moon size={18} className="text-accent" /> : <Sun size={18} className="text-warning" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{t("darkMode")}</p>
              <p className="text-xs text-muted-foreground">{t("darkModeDesc")}</p>
            </div>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                theme === "dark" ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                  theme === "dark" ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* App Mode */}
      <section className="space-y-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Experience</h3>
        <div className="bg-card border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-xl p-2.5">
              <Zap size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Simple Mode</p>
              <p className="text-xs text-muted-foreground">Hide advanced analytics for a cleaner experience</p>
            </div>
            <button
              onClick={() => setAppMode(appMode === "simple" ? "advanced" : "simple")}
              className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                appMode === "simple" ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                  appMode === "simple" ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Gamification toggle */}
      <section className="space-y-3 animate-fade-up" style={{ animationDelay: "220ms" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gamification</h3>
        <div className="bg-card border rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 rounded-xl p-2.5">
              <Gamepad2 size={18} className="text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Gamification</p>
              <p className="text-xs text-muted-foreground">XP, levels, badges & daily missions</p>
            </div>
            <button
              onClick={() => setGamificationEnabled(!gamificationEnabled)}
              className={`w-12 h-7 rounded-full transition-all duration-300 relative ${
                gamificationEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                  gamificationEnabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <section className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <div className="bg-card border rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-destructive/10 text-destructive rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97]"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}
