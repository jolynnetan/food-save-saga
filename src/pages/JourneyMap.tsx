import { useGamification, LEVELS } from "@/contexts/GamificationContext";
import { MapPin, Star, Trophy, Sparkles } from "lucide-react";

const milestones = [
  { xp: 0, title: "Start Your Journey", emoji: "🌱", description: "Welcome to SavePlate!" },
  { xp: 50, title: "First Steps", emoji: "👣", description: "Logged your first meals" },
  { xp: 100, title: "Saver Unlocked", emoji: "🌿", description: "Reached Level 2" },
  { xp: 200, title: "Waste Fighter", emoji: "💪", description: "Saved 2kg of food" },
  { xp: 300, title: "Hero Status", emoji: "👑", description: "Reached Level 3" },
  { xp: 450, title: "Community Impact", emoji: "🤝", description: "Helped feed others" },
  { xp: 600, title: "Champion Rise", emoji: "⚔️", description: "Reached Level 4" },
  { xp: 800, title: "Master Saver", emoji: "🏅", description: "50 meals rescued" },
  { xp: 1000, title: "Living Legend", emoji: "✨", description: "Reached the pinnacle" },
  { xp: 1500, title: "World Changer", emoji: "🌍", description: "100+ meals saved" },
  { xp: 2000, title: "Ultimate Hero", emoji: "🦸", description: "Maximum impact!" },
];

export default function JourneyMap() {
  const { xp, level } = useGamification();

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground">Your Journey</h2>
        <p className="text-muted-foreground mt-1">Follow your path from Beginner to Legend</p>
      </div>

      {/* Current position */}
      <div className="bg-card border rounded-2xl p-4 flex items-center gap-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <img src={level.mascot} alt={level.title} width={56} height={56} className="drop-shadow-md" />
        <div>
          <p className="text-sm text-muted-foreground">You are here</p>
          <p className="text-lg font-bold text-foreground">{level.emoji} {level.title}</p>
          <p className="text-xs text-primary font-semibold">{xp} XP earned</p>
        </div>
      </div>

      {/* Journey path */}
      <div className="relative pl-8 space-y-0 animate-fade-up" style={{ animationDelay: "160ms" }}>
        {/* Vertical line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border" />
        {/* Progress line */}
        <div
          className="absolute left-[15px] top-4 w-0.5 bg-primary transition-all duration-700"
          style={{
            height: `${Math.min(100, (xp / 2000) * 100)}%`,
          }}
        />

        {milestones.map((ms, i) => {
          const reached = xp >= ms.xp;
          const isCurrent = xp >= ms.xp && (i === milestones.length - 1 || xp < milestones[i + 1].xp);

          return (
            <div key={ms.xp} className="relative pb-6">
              {/* Node */}
              <div className={`absolute -left-8 top-1 w-7 h-7 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                reached
                  ? isCurrent
                    ? "border-primary bg-primary text-primary-foreground shadow-primary-glow animate-pulse"
                    : "border-primary bg-primary/10 text-primary"
                  : "border-muted bg-card text-muted-foreground"
              }`}>
                {reached ? (
                  isCurrent ? <MapPin size={14} /> : <Star size={12} />
                ) : (
                  <span className="text-[10px] font-bold">{ms.xp}</span>
                )}
              </div>

              {/* Content */}
              <div className={`ml-3 p-3 rounded-xl border transition-all duration-300 ${
                isCurrent
                  ? "bg-primary/5 border-primary/20 shadow-soft-sm"
                  : reached
                    ? "bg-card border-border"
                    : "bg-muted/30 border-border/50 opacity-60"
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${reached ? "" : "grayscale"}`}>{ms.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                      {ms.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{ms.description}</p>
                  </div>
                  {isCurrent && (
                    <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                      NOW
                    </span>
                  )}
                </div>
                {!reached && (
                  <p className="text-[10px] text-muted-foreground mt-1 ml-7">
                    {ms.xp - xp} XP to unlock
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
