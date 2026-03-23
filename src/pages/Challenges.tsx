import { useState } from "react";
import { Flame, Calendar, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Challenge = {
  id: number;
  title: string;
  description: string;
  emoji: string;
  pts: number;
  done: boolean;
  category: "daily" | "weekly" | "monthly";
};

const initialChallenges: Challenge[] = [
  { id: 1, title: "Finish yesterday's rice", description: "Don't let cooked rice go to waste", emoji: "🍚", pts: 10, done: true, category: "daily" },
  { id: 2, title: "Plan meals for the week", description: "Create a meal plan to avoid over-buying", emoji: "📋", pts: 15, done: false, category: "daily" },
  { id: 3, title: "Use wilting vegetables", description: "Cook with veggies before they go bad", emoji: "🥬", pts: 20, done: false, category: "daily" },
  { id: 4, title: "Zero waste lunch", description: "Prepare a lunch with no food waste", emoji: "🥗", pts: 15, done: false, category: "daily" },
  { id: 5, title: "5 zero-waste days", description: "Go 5 consecutive days without wasting food", emoji: "🏆", pts: 100, done: false, category: "weekly" },
  { id: 6, title: "Try 3 leftover recipes", description: "Cook 3 meals using only leftovers", emoji: "👨‍🍳", pts: 75, done: false, category: "weekly" },
  { id: 7, title: "Reduce grocery bill 10%", description: "Spend less by buying only what you need", emoji: "💰", pts: 50, done: false, category: "weekly" },
  { id: 8, title: "30-day no waste streak", description: "An entire month without food waste", emoji: "🌟", pts: 500, done: false, category: "monthly" },
  { id: 9, title: "Compost challenge", description: "Start composting your food scraps", emoji: "🌱", pts: 200, done: false, category: "monthly" },
];

const tabs = [
  { key: "daily" as const, label: "Daily", icon: Flame },
  { key: "weekly" as const, label: "Weekly", icon: Calendar },
  { key: "monthly" as const, label: "Monthly", icon: Star },
];

export default function Challenges() {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  const [totalPoints, setTotalPoints] = useState(1240);
  const { toast } = useToast();

  const toggleChallenge = (id: number) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newDone = !c.done;
          if (newDone) {
            setTotalPoints((p) => p + c.pts);
            toast({ title: `+${c.pts} points earned! 🎉`, description: `Completed: ${c.title}` });
          } else {
            setTotalPoints((p) => p - c.pts);
          }
          return { ...c, done: newDone };
        }
        return c;
      })
    );
  };

  const filtered = challenges.filter((c) => c.category === activeTab);
  const completedCount = filtered.filter((c) => c.done).length;
  const totalPts = filtered.filter((c) => c.done).reduce((sum, c) => sum + c.pts, 0);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Challenges</h2>
        <p className="text-muted-foreground mt-1">Complete tasks to earn rewards & reduce waste</p>
      </div>

      {/* Total points banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between animate-fade-up" style={{ animationDelay: "60ms" }}>
        <span className="text-sm text-foreground">Total Points</span>
        <span className="text-lg font-bold text-primary tabular-nums">{totalPoints.toLocaleString()} pts</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {completedCount}/{filtered.length} completed
          </span>
          <span className="text-sm font-semibold text-primary">+{totalPts} pts earned</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div
            className="bg-primary rounded-full h-2.5 transition-all duration-500"
            style={{ width: `${filtered.length ? (completedCount / filtered.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Challenge List */}
      <div className="space-y-3">
        {filtered.map((challenge, i) => (
          <button
            key={challenge.id}
            onClick={() => toggleChallenge(challenge.id)}
            className={`w-full text-left flex items-start gap-3 bg-card rounded-xl p-4 border transition-all duration-200 active:scale-[0.97] animate-fade-up ${
              challenge.done ? "opacity-60" : "shadow-sm hover:shadow-md"
            }`}
            style={{ animationDelay: `${240 + i * 60}ms` }}
          >
            <span className="text-2xl mt-0.5">{challenge.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${challenge.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {challenge.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                +{challenge.pts}
              </span>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  challenge.done ? "bg-success border-success" : "border-muted-foreground/30"
                }`}
              >
                {challenge.done && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
