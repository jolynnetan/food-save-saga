import { useState, useEffect } from "react";
import { Flame, Leaf, TrendingDown, ChevronRight, Camera, Apple, Package, MapPin, ShoppingCart, Calculator, Trophy, Clock, BarChart3, Building2, BellRing } from "lucide-react";
import ImpactStory from "@/components/ImpactStory";
import { Link } from "react-router-dom";
import { usePoints } from "@/contexts/PointsContext";
import { useSettings } from "@/contexts/SettingsContext";

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
    } catch { /* ignore */ }
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

export default function Dashboard() {
  const { streak } = usePoints();
  const { appMode } = useSettings();
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

  useEffect(() => {
    setTodayTasks(getDailyChallenges());
  }, []);

  const quickStats = [
    { icon: Flame, label: "Streak", value: `${streak}`, unit: "days", color: "text-streak", bg: "bg-streak/10", border: "border-streak/20" },
    { icon: Leaf, label: "Saved", value: "3.2", unit: "kg", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { icon: TrendingDown, label: "Waste", value: "-24", unit: "%", color: "text-success", bg: "bg-success/10", border: "border-success/20" },
  ];

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5">
      {/* Hero Greeting */}
      <div className="animate-fade-up rounded-3xl gradient-hero p-5 text-primary-foreground shadow-primary-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold leading-tight text-balance">
            Good morning! 👋
          </h2>
          <p className="text-primary-foreground/80 mt-1.5 text-sm">
            You've saved <span className="font-bold text-primary-foreground">3.2 kg</span> of food this week. Keep going!
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      {!isSimple && (
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
          {quickStats.map(({ icon: Icon, label, value, unit, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-3.5 text-center hover-lift`}>
              <div className={`${bg} w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={color} size={18} strokeWidth={2.2} />
              </div>
              <p className="text-xl font-extrabold text-foreground tabular-nums">
                {value}<span className="text-xs font-medium text-muted-foreground ml-0.5">{unit}</span>
              </p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Scan CTA */}
      <Link
        to="/scanner"
        className="flex items-center gap-4 gradient-primary text-primary-foreground rounded-2xl p-4 shadow-primary-glow transition-all duration-300 btn-press animate-fade-up group"
        style={{ animationDelay: "160ms" }}
      >
        <div className="bg-primary-foreground/15 rounded-2xl p-3 group-hover:bg-primary-foreground/25 transition-colors duration-300">
          <Camera size={24} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-[15px]">Scan your leftovers</p>
          <p className="text-sm text-primary-foreground/75">Get recipe ideas & reduce waste</p>
        </div>
        <ChevronRight size={20} className="opacity-60 group-hover:translate-x-1 transition-transform duration-300" />
      </Link>

      {/* Calorie Summary */}
      <Link
        to="/calories"
        className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 transition-all duration-300 hover-lift animate-fade-up group shadow-soft-sm"
        style={{ animationDelay: "200ms" }}
      >
        <div className="bg-primary/10 rounded-2xl p-3 border border-primary/20">
          <Apple size={22} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">Today's Calories</p>
          <p className="text-xs text-muted-foreground mt-0.5">Track meals & stay on target</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" />
      </Link>

      {/* Impact Story */}
      {!isSimple && <ImpactStory />}

      {/* Today's Challenges */}
      <section className="animate-fade-up" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground">Today's Challenges</h3>
          <Link to="/challenges" className="text-sm text-primary font-semibold hover:underline">See all</Link>
        </div>
        <div className="space-y-2.5">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 bg-card rounded-2xl p-3.5 border transition-all duration-300 hover-lift ${
                task.done ? "opacity-60 border-success/20" : "border-border shadow-soft-sm"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <span className="text-lg">{task.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  +{task.pts}
                </span>
                <div
                  className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    task.done ? "bg-success border-success shadow-glow" : "border-muted-foreground/25"
                  }`}
                >
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

      {/* Quick Tools */}
      <section className="animate-fade-up" style={{ animationDelay: "280ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-foreground">🧰 Quick Tools</h3>
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
          <h3 className="text-base font-bold text-foreground mb-3">🌍 Why It Matters</h3>
          <div className="bg-primary/8 border border-primary/15 rounded-2xl p-4 shadow-soft-sm">
            <p className="text-sm text-foreground leading-relaxed font-medium">
              {getDailyQuote()}
            </p>
          </div>
        </section>
      )}

      {/* Daily Tip */}
      <section className="animate-fade-up" style={{ animationDelay: "400ms" }}>
        <h3 className="text-base font-bold text-foreground mb-3">💡 Daily Tip</h3>
        <div className="gradient-card border border-border rounded-2xl p-4 shadow-soft-sm">
          <p className="text-sm text-secondary-foreground leading-relaxed">
            {tips[Math.floor(Math.random() * tips.length)]}
          </p>
        </div>
      </section>
    </div>
  );
}
