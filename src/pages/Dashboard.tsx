import { useState, useEffect } from "react";
import { Flame, Leaf, TrendingDown, ChevronRight, Camera, Apple, Package, MapPin, ShoppingCart, Calculator, Trophy, Clock, BarChart3, Building2, BellRing, Sparkles, Zap } from "lucide-react";
import ImpactStory from "@/components/ImpactStory";
import { Link } from "react-router-dom";
import { usePoints } from "@/contexts/PointsContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useGamification, LEVELS } from "@/contexts/GamificationContext";

const initialDailyTasks = [
  { id: 1, title: "Finish yesterday's rice", emoji: "🍚", done: false, pts: 10 },
  { id: 2, title: "Plan meals for the week", emoji: "📋", done: false, pts: 15 },
  { id: 3, title: "Use wilting vegetables", emoji: "🥬", done: false, pts: 20 },
];

function getDailyChallenges() {
  const saved = localStorage.getItem("sp-challenges");
  if (saved) {
    try {
      const all = JSON.parse(saved);
      const daily = all.filter((c: any) => c.category === "daily");
      if (daily.length > 0) return daily.map((c: any) => ({ id: c.id, title: c.title, emoji: c.emoji, done: c.done, pts: c.pts }));
    } catch {}
  }
  return initialDailyTasks;
}

const tips = [
  "Store herbs in a glass of water to keep them fresh 3x longer 🌿",
  "Freeze overripe bananas for smoothies later 🍌",
  "Use stale bread to make croutons or breadcrumbs 🍞",
];

const motivationalQuotes = [
  "One-third of all food produced globally is wasted — your small actions today change that statistic. 🌍",
  "Every meal you save feeds possibility. Food security starts on your plate. 💚",
  "828 million people go hungry every night. Reducing waste is an act of solidarity. ✊",
  "When you finish your leftovers, you're not just saving money — you're saving the planet's resources. 🌱",
  "It takes 1,000 litres of water to produce 1 litre of milk. Nothing we save is too small to matter. 💧",
  "Food waste in landfills produces methane, 80× more potent than CO₂. Your choices make the air cleaner. 🌬️",
  "A family that reduces food waste saves an average of $1,500 a year. Your wallet thanks you too. 💰",
  "Every grain of rice represents someone's labour under the sun. Honour it by wasting less. 🌾",
  "Sustainable eating isn't a sacrifice — it's a superpower. You're already a hero. 🦸",
  "The best time to fight food waste was yesterday. The second best time is right now. ⏰",
];

const moreShortcuts = [
  { to: "/tracker", icon: BarChart3, title: "Tracker", desc: "Waste analytics", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  { to: "/pantry", icon: Package, title: "Pantry", desc: "Track expiry", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { to: "/foodbank", icon: Building2, title: "Foodbank", desc: "NGO donations", color: "text-earth", bg: "bg-earth/10", border: "border-earth/20" },
  { to: "/shopping", icon: ShoppingCart, title: "Shopping", desc: "Smart lists", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  { to: "/leaderboard", icon: Trophy, title: "Leaderboard", desc: "Rank up", color: "text-streak", bg: "bg-streak/10", border: "border-streak/20" },
  { to: "/reminders", icon: BellRing, title: "Reminders", desc: "Food checks", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
];

function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return motivationalQuotes[dayOfYear % motivationalQuotes.length];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* Calorie ring chart */
function CalorieRing({ consumed = 1450, target = 2000 }: { consumed?: number; target?: number }) {
  const pct = Math.min(consumed / target, 1);
  const r = 42;
  const circ = 2 * Math.PI * r;
  const offset = circ - pct * circ;
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke="url(#calorieGrad)"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="animate-ring-progress"
        />
        <defs>
          <linearGradient id="calorieGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(152, 55%, 34%)" />
            <stop offset="100%" stopColor="hsl(43, 96%, 56%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold text-foreground tabular-nums leading-none">{consumed}</span>
        <span className="text-[9px] font-medium text-muted-foreground">/ {target} cal</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { streak } = usePoints();
  const { appMode } = useSettings();
  const { level, xp, xpProgress, dailyMissions, completeMission, recentAchievements, gamificationEnabled, seasonalEvent } = useGamification();
  const [todayTasks, setTodayTasks] = useState(getDailyChallenges);
  const isSimple = appMode === "simple";

  useEffect(() => {
    const handleFocus = () => setTodayTasks(getDailyChallenges());
    window.addEventListener("focus", handleFocus);
    const handleStorage = () => setTodayTasks(getDailyChallenges());
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => { setTodayTasks(getDailyChallenges()); }, []);

  const quickStats = [
    { icon: Flame, label: "Streak", value: `${streak}`, unit: "days", color: "text-streak", bg: "bg-streak/10", border: "border-streak/20" },
    { icon: Leaf, label: "Saved", value: "3.2", unit: "kg", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { icon: TrendingDown, label: "CO₂", value: "-8.1", unit: "kg", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  ];

  const nextLevel = LEVELS[Math.min(level.level, LEVELS.length - 1)];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
      {/* Hero Greeting with Nibble Mascot */}
      <div className="animate-fade-up rounded-3xl gradient-hero p-5 text-primary-foreground shadow-primary-glow relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/3 rounded-full" />

        <div className="relative z-10 flex items-start gap-4">
          {gamificationEnabled && (
            <div className="relative shrink-0">
              <img
                src={level.mascot}
                alt={`Nibble - ${level.title}`}
                width={72}
                height={72}
                className="drop-shadow-lg animate-breathe rounded-2xl"
              />
              <div className="absolute -bottom-1 -right-1 bg-primary-foreground/20 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                {level.emoji}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-tight text-balance">
              {getGreeting()}! 👋
            </h2>
            <p className="text-primary-foreground/80 mt-1 text-sm leading-relaxed">
              You've saved <span className="font-bold text-primary-foreground">3.2 kg</span> of food this week. Keep going!
            </p>
            {gamificationEnabled && (
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-primary-foreground bg-primary-foreground/15 backdrop-blur-sm rounded-full px-2.5 py-1 border border-primary-foreground/10">
                  {level.emoji} Lv.{level.level} {level.title}
                </span>
                <span className="text-[11px] text-primary-foreground/70 font-semibold tabular-nums">
                  {xp} XP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Inline XP bar */}
        {gamificationEnabled && (
          <div className="relative z-10 mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-primary-foreground/60">{level.title}</span>
              <span className="text-[10px] font-medium text-primary-foreground/60">{nextLevel?.title || "Max"}</span>
            </div>
            <div className="w-full bg-primary-foreground/15 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-primary-foreground/90 animate-xp-fill relative"
                style={{ width: `${xpProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer rounded-full" />
              </div>
            </div>
            <div className="text-right mt-1">
              <span className="text-[10px] font-semibold text-primary-foreground/70 tabular-nums">{xp}/{level.maxXP} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* Seasonal Event Banner */}
      {gamificationEnabled && seasonalEvent && !isSimple && (
        <div className="animate-fade-up gradient-gold text-gold-foreground rounded-2xl p-3.5 flex items-center gap-3 shadow-gold-glow" style={{ animationDelay: "60ms" }}>
          <span className="text-2xl animate-wiggle">{seasonalEvent.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-bold">{seasonalEvent.title}</p>
            <p className="text-[11px] opacity-80">{seasonalEvent.endsIn}</p>
          </div>
          <span className="text-[10px] font-bold bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
            🔴 LIVE
          </span>
        </div>
      )}

      {/* Quick Stats */}
      {!isSimple && (
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
          {quickStats.map(({ icon: Icon, label, value, unit, color, bg, border }) => (
            <div key={label} className="stat-card">
              <div className={`${bg} border ${border} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={color} size={20} strokeWidth={2.2} />
              </div>
              <p className="text-xl font-extrabold text-foreground tabular-nums leading-none">
                {value}<span className="text-[10px] font-medium text-muted-foreground ml-0.5">{unit}</span>
              </p>
              <p className="text-[10px] text-muted-foreground font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Daily Missions (Quest Cards) */}
      {gamificationEnabled && !isSimple && (
        <section className="animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 gradient-reward rounded-lg flex items-center justify-center shadow-reward-glow">
                <Zap size={14} className="text-white" />
              </div>
              <h3 className="text-base font-bold text-foreground">Daily Quests</h3>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {dailyMissions.filter(m => m.completed).length}/{dailyMissions.length}
            </span>
          </div>
          <div className="space-y-2.5">
            {dailyMissions.map((mission, i) => (
              <button
                key={mission.id}
                onClick={() => !mission.completed && completeMission(mission.id)}
                disabled={mission.completed}
                className={`quest-card w-full flex items-center gap-3 ${
                  mission.completed ? "opacity-60 border-success/30 bg-success/5" : ""
                }`}
                style={{ animationDelay: `${140 + i * 40}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  mission.completed ? "bg-success/15" : "bg-muted"
                }`}>
                  <span className="text-xl">{mission.emoji}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-semibold ${mission.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {mission.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{mission.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold gradient-gold text-gold-foreground px-2 py-0.5 rounded-full shadow-sm">
                    +{mission.xpReward} XP
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    mission.completed ? "bg-success border-success shadow-glow" : "border-muted-foreground/25"
                  }`}>
                    {mission.completed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Calorie Ring + Scan CTA row */}
      <div className="grid grid-cols-5 gap-3 animate-fade-up" style={{ animationDelay: "160ms" }}>
        {/* Calorie Ring */}
        <Link
          to="/calories"
          className="col-span-2 bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center hover-lift shadow-soft-sm"
        >
          <CalorieRing />
          <p className="text-[11px] font-semibold text-foreground mt-2">Today's Calories</p>
        </Link>

        {/* Scan CTA */}
        <Link
          to="/scanner"
          className="col-span-3 gradient-primary text-primary-foreground rounded-2xl p-4 shadow-primary-glow btn-press flex flex-col justify-between group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
          <div className="relative z-10">
            <div className="bg-primary-foreground/15 rounded-xl p-2.5 w-fit group-hover:bg-primary-foreground/25 transition-colors duration-300">
              <Camera size={22} />
            </div>
            <p className="font-bold text-[15px] mt-3">Scan leftovers</p>
            <p className="text-sm text-primary-foreground/70 mt-0.5">Get recipe ideas</p>
          </div>
          <ChevronRight size={18} className="opacity-50 self-end group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>

      {/* Today's Challenges */}
      <section className="animate-fade-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h3 className="text-base font-bold text-foreground">Today's Challenges</h3>
          </div>
          <Link to="/challenges" className="text-sm text-primary font-semibold hover:underline">See all</Link>
        </div>
        <div className="space-y-2.5">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className={`quest-card flex items-center gap-3 ${
                task.done ? "opacity-60 border-success/30 bg-success/5" : ""
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                task.done ? "bg-success/15" : "bg-muted"
              }`}>
                <span className="text-lg">{task.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold gradient-gold text-gold-foreground px-2 py-0.5 rounded-full shadow-sm">
                  +{task.pts}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  task.done ? "bg-success border-success shadow-glow" : "border-muted-foreground/25"
                }`}>
                  {task.done && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Achievements */}
      {gamificationEnabled && !isSimple && recentAchievements.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏅</span>
              <h3 className="text-base font-bold text-foreground">Recent Achievements</h3>
            </div>
            <Link to="/achievements" className="text-sm text-primary font-semibold hover:underline">View all</Link>
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {recentAchievements.slice(0, 5).map((a, i) => (
              <div key={i} className="badge-card shrink-0 w-28 animate-badge-pop" style={{ animationDelay: `${250 + i * 60}ms` }}>
                <span className="text-3xl block mb-2">{a.emoji}</span>
                <p className="text-[11px] font-bold text-foreground truncate">{a.title}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {new Date(a.time).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Impact Story */}
      {!isSimple && <ImpactStory />}

      {/* Quick Tools */}
      <section className="animate-fade-up" style={{ animationDelay: "280ms" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧰</span>
            <h3 className="text-base font-bold text-foreground">Quick Tools</h3>
          </div>
          <Link to="/more" className="text-sm text-primary font-semibold hover:underline">See all</Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {moreShortcuts.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="flex flex-col items-center gap-2 bg-card border border-border rounded-2xl p-3.5 transition-all duration-300 hover-lift shadow-soft-sm group"
            >
              <div className={`${f.bg} border ${f.border} rounded-2xl p-2.5 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={f.color} size={20} strokeWidth={2} />
              </div>
              <div className="text-center">
                <span className="text-[11px] font-bold text-foreground block leading-tight">{f.title}</span>
                <span className="text-[9px] text-muted-foreground block leading-tight mt-0.5">{f.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily Motivation */}
      {!isSimple && (
        <section className="animate-fade-up" style={{ animationDelay: "320ms" }}>
          <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <span>🌍</span> Why It Matters
          </h3>
          <div className="bg-primary/8 border border-primary/15 rounded-2xl p-4 shadow-soft-sm">
            <p className="text-sm text-foreground leading-relaxed font-medium">
              {getDailyQuote()}
            </p>
          </div>
        </section>
      )}

      {/* Daily Tip */}
      <section className="animate-fade-up" style={{ animationDelay: "400ms" }}>
        <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <span>💡</span> Daily Tip
        </h3>
        <div className="gradient-card border border-border rounded-2xl p-4 shadow-soft-sm">
          <p className="text-sm text-secondary-foreground leading-relaxed">
            {tips[Math.floor(Math.random() * tips.length)]}
          </p>
        </div>
      </section>
    </div>
  );
}
