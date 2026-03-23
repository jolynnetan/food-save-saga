import { useState, useEffect } from "react";
import { usePoints } from "@/contexts/PointsContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const LEVELS = [
  { name: "Beginner", minPts: 0, emoji: "🌱", color: "bg-muted text-muted-foreground" },
  { name: "Food Saver", minPts: 100, emoji: "🥗", color: "bg-success/15 text-success" },
  { name: "Waste Warrior", minPts: 300, emoji: "⚔️", color: "bg-primary/15 text-primary" },
  { name: "Eco Champion", minPts: 600, emoji: "🏅", color: "bg-streak/15 text-streak" },
  { name: "Food Hero", minPts: 1000, emoji: "🦸", color: "bg-warning/15 text-warning" },
];

const MILESTONES = [
  { id: "meals5", label: "5 Meals Saved", threshold: 5, emoji: "🍽️", unit: "meals" },
  { id: "meals10", label: "10 Meals Saved", threshold: 10, emoji: "🍲", unit: "meals" },
  { id: "meals25", label: "25 Meals Saved", threshold: 25, emoji: "🥘", unit: "meals" },
  { id: "kg1", label: "1 kg Saved", threshold: 1, emoji: "📦", unit: "kg" },
  { id: "kg5", label: "5 kg Saved", threshold: 5, emoji: "🎒", unit: "kg" },
  { id: "kg10", label: "10 kg Saved", threshold: 10, emoji: "🏋️", unit: "kg" },
  { id: "streak7", label: "7-Day Streak", threshold: 7, emoji: "🔥", unit: "streak" },
  { id: "streak30", label: "30-Day Streak", threshold: 30, emoji: "💎", unit: "streak" },
];

function getStats() {
  const saved = parseFloat(localStorage.getItem("sp-food-saved-kg") || "3.2");
  const meals = parseInt(localStorage.getItem("sp-meals-saved") || "8", 10);
  return { saved, meals };
}

function getLevel(points: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPts) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  return { current, next };
}

function getImpactStory(saved: number, meals: number) {
  if (saved >= 10) return `You saved enough food to feed ${Math.floor(saved * 2)} people! 🌍`;
  if (meals >= 10) return `${meals} meals rescued — that's real change in action! 💪`;
  if (saved >= 5) return `${saved} kg saved — like rescuing ${Math.floor(saved * 3)} plates of food! 🍽️`;
  if (meals >= 5) return `${meals} meals saved from the bin — every bite counts! ✊`;
  return `You've started your journey — ${saved} kg saved so far! Keep going! 🌱`;
}

export default function ImpactStory() {
  const { points, streak } = usePoints();
  const [stats, setStats] = useState(getStats);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const { current: level, next: nextLevel } = getLevel(points);
  const progressToNext = nextLevel
    ? Math.min(100, ((points - level.minPts) / (nextLevel.minPts - level.minPts)) * 100)
    : 100;

  const unlockedMilestones = MILESTONES.filter((m) => {
    if (m.unit === "meals") return stats.meals >= m.threshold;
    if (m.unit === "kg") return stats.saved >= m.threshold;
    if (m.unit === "streak") return streak >= m.threshold;
    return false;
  });

  return (
    <section className="space-y-3 animate-fade-up" style={{ animationDelay: "160ms" }}>
      <h3 className="text-base font-semibold text-foreground">🌟 Your Impact</h3>

      {/* Impact story card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-success/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
        <div className="absolute -top-6 -right-6 text-6xl opacity-10 select-none">🌍</div>
        <p className="text-sm font-medium text-foreground leading-relaxed relative z-10">
          {getImpactStory(stats.saved, stats.meals)}
        </p>
        <div className="flex gap-4 mt-3">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{stats.saved} kg</p>
            <p className="text-[10px] text-muted-foreground">Food Saved</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-success">{stats.meals}</p>
            <p className="text-[10px] text-muted-foreground">Meals Rescued</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-streak">{(stats.saved * 2.5).toFixed(1)} kg</p>
            <p className="text-[10px] text-muted-foreground">CO₂ Reduced</p>
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="bg-card border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{level.emoji}</span>
            <div>
              <Badge className={`${level.color} border-0 text-[10px]`}>{level.name}</Badge>
            </div>
          </div>
          {nextLevel && (
            <span className="text-[10px] text-muted-foreground">
              Next: {nextLevel.emoji} {nextLevel.name}
            </span>
          )}
        </div>
        <Progress value={progressToNext} className="h-2.5 bg-muted" />
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {nextLevel ? `${nextLevel.minPts - points} pts to next level` : "Max level reached! 🎉"}
        </p>
      </div>

      {/* Milestone badges */}
      {unlockedMilestones.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unlockedMilestones.map((m) => (
            <Badge
              key={m.id}
              variant="secondary"
              className={`text-[10px] gap-1 transition-all duration-500 ${animate ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
            >
              {m.emoji} {m.label}
            </Badge>
          ))}
        </div>
      )}
    </section>
  );
}
