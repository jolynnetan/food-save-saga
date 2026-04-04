import { useGamification, LEVELS } from "@/contexts/GamificationContext";
import { useT } from "@/contexts/SettingsContext";
import { Lock, CheckCircle2 } from "lucide-react";

export default function Achievements() {
  const { badges, xp, level, xpProgress } = useGamification();
  const t = useT();
  const unlockedCount = badges.filter(b => b.unlocked).length;

  const categoryLabels: Record<string, { label: string; emoji: string }> = {
    streak: { label: t("streaks"), emoji: "🔥" },
    waste: { label: t("foodSaving"), emoji: "🥬" },
    community: { label: t("community"), emoji: "🤝" },
    mastery: { label: t("mastery"), emoji: "🎯" },
  };

  const grouped = badges.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, typeof badges>);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
        <p className="text-muted-foreground mt-1">{unlockedCount}/{badges.length} badges unlocked</p>
      </div>

      {/* Level card */}
      <div className="gradient-hero rounded-3xl p-5 text-primary-foreground animate-fade-up relative overflow-hidden" style={{ animationDelay: "80ms" }}>
        <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="flex items-center gap-4 relative z-10">
          <img src={level.mascot} alt={level.title} width={72} height={72} className="drop-shadow-lg" />
          <div className="flex-1">
            <p className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">Level {level.level}</p>
            <p className="text-xl font-bold">{level.title}</p>
            <div className="mt-2 w-full bg-primary-foreground/20 rounded-full h-2.5">
              <div
                className="bg-primary-foreground rounded-full h-2.5 transition-all duration-700"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-primary-foreground/70 mt-1">{xp} / {level.maxXP} XP</p>
          </div>
        </div>
      </div>

      {/* Level progression */}
      <div className="flex items-center justify-between bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
        {LEVELS.map((l, i) => (
          <div key={l.level} className="flex flex-col items-center gap-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              xp >= l.minXP
                ? "border-primary bg-primary/10"
                : "border-muted bg-muted"
            }`}>
              <span className="text-lg">{l.emoji}</span>
            </div>
            <span className={`text-[9px] font-semibold ${xp >= l.minXP ? "text-primary" : "text-muted-foreground"}`}>
              {l.title}
            </span>
            {i < LEVELS.length - 1 && (
              <div className="hidden" /> // connector handled by flex gap
            )}
          </div>
        ))}
      </div>

      {/* Badges by category */}
      {Object.entries(grouped).map(([cat, catBadges], ci) => (
        <section key={cat} className="animate-fade-up" style={{ animationDelay: `${160 + ci * 60}ms` }}>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span>{categoryLabels[cat]?.emoji}</span>
            {categoryLabels[cat]?.label || cat}
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {catBadges.map(badge => (
              <div
                key={badge.id}
                className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3.5 border transition-all duration-300 ${
                  badge.unlocked
                    ? "bg-primary/5 border-primary/20 shadow-soft-sm"
                    : "bg-muted/50 border-border opacity-50"
                }`}
              >
                <div className={`text-3xl ${badge.unlocked ? "" : "grayscale"}`}>
                  {badge.emoji}
                </div>
                <span className="text-[10px] font-bold text-foreground text-center leading-tight">
                  {badge.title}
                </span>
                {badge.unlocked ? (
                  <CheckCircle2 size={14} className="text-primary absolute top-2 right-2" />
                ) : (
                  <Lock size={12} className="text-muted-foreground absolute top-2 right-2" />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
