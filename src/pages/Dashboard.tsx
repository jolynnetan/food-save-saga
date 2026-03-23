import { useState, useEffect } from "react";
import { Flame, Leaf, TrendingDown, ChevronRight, Camera, Apple, Package, MapPin, ShoppingCart, Calculator, Trophy, Clock, BarChart3, Building2, BellRing } from "lucide-react";
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
  { to: "/tracker", icon: BarChart3, title: "Tracker", desc: "Waste analytics", color: "text-success", bg: "bg-success/10" },
  { to: "/pantry", icon: Package, title: "Pantry", desc: "Track expiry", color: "text-primary", bg: "bg-primary/10" },
  { to: "/foodbank", icon: Building2, title: "Foodbank", desc: "NGO donations", color: "text-earth", bg: "bg-earth/10" },
  { to: "/shopping", icon: ShoppingCart, title: "Shopping", desc: "Smart lists", color: "text-success", bg: "bg-success/10" },
  { to: "/leaderboard", icon: Trophy, title: "Leaderboard", desc: "Rank up", color: "text-streak", bg: "bg-streak/10" },
  { to: "/reminders", icon: BellRing, title: "Reminders", desc: "Food checks", color: "text-blue-500", bg: "bg-blue-500/10" },
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
  const [todayTasks, setTodayTasks] = useState(getDailyChallenges);

  // Re-sync when returning to this page (e.g. from challenges page)
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

  // Also re-sync on mount
  useEffect(() => {
    setTodayTasks(getDailyChallenges());
  }, []);

  const quickStats = [
    { icon: Flame, label: "Streak", value: `${streak} days`, color: "text-streak", bg: "bg-streak/10" },
    { icon: Leaf, label: "Saved", value: "3.2 kg", color: "text-leaf", bg: "bg-leaf/10" },
    { icon: TrendingDown, label: "Waste", value: "-24%", color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
      {/* Greeting */}
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground leading-tight text-balance">
          Good morning! 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          You've saved <span className="font-semibold text-primary">3.2 kg</span> of food this week.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {quickStats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
            <Icon className={`${color} mx-auto mb-1`} size={22} />
            <p className="text-lg font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Scan CTA */}
      <Link
        to="/scanner"
        className="flex items-center gap-4 bg-primary text-primary-foreground rounded-2xl p-4 shadow-lg shadow-primary/20 transition-transform duration-200 active:scale-[0.97] animate-fade-up"
        style={{ animationDelay: "160ms" }}
      >
        <div className="bg-primary-foreground/20 rounded-xl p-3">
          <Camera size={24} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-base">Scan your leftovers</p>
          <p className="text-sm opacity-80">Get recipe ideas & reduce waste</p>
        </div>
        <ChevronRight size={20} className="opacity-60" />
      </Link>

      {/* Calorie Summary */}
      <Link
        to="/calories"
        className="flex items-center gap-4 bg-card border rounded-2xl p-4 transition-all duration-200 active:scale-[0.97] hover:shadow-md animate-fade-up"
        style={{ animationDelay: "200ms" }}
      >
        <div className="bg-primary/10 rounded-xl p-3">
          <Apple size={24} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-foreground">Today's Calories</p>
          <p className="text-xs text-muted-foreground mt-0.5">Track meals & stay on target</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground" />
      </Link>

      {/* Today's Challenges */}
      <section className="animate-fade-up" style={{ animationDelay: "240ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">Today's Challenges</h3>
          <Link to="/challenges" className="text-sm text-primary font-medium">See all</Link>
        </div>
        <div className="space-y-2.5">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 bg-card rounded-xl p-3 border transition-all duration-200 ${
                task.done ? "opacity-60" : "shadow-sm"
              }`}
            >
              <span className="text-xl">{task.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {task.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  +{task.pts}
                </span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    task.done ? "bg-success border-success" : "border-muted-foreground/30"
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

      {/* More Tools Shortcuts */}
      <section className="animate-fade-up" style={{ animationDelay: "280ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-foreground">🧰 Quick Tools</h3>
          <Link to="/more" className="text-sm text-primary font-medium">See all</Link>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {moreShortcuts.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="flex flex-col items-center gap-1.5 bg-card border rounded-2xl p-3 transition-all duration-200 active:scale-[0.95] hover:shadow-md"
            >
              <div className={`${f.bg} rounded-xl p-2.5`}>
                <f.icon className={f.color} size={20} />
              </div>
              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{f.title}</span>
              <span className="text-[9px] text-muted-foreground text-center leading-tight">{f.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily Motivation */}
      <section className="animate-fade-up" style={{ animationDelay: "320ms" }}>
        <h3 className="text-base font-semibold text-foreground mb-3">🌍 Why It Matters</h3>
        <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
          <p className="text-sm text-foreground leading-relaxed font-medium">
            {getDailyQuote()}
          </p>
        </div>
      </section>

      {/* Daily Tip */}
      <section className="animate-fade-up" style={{ animationDelay: "400ms" }}>
        <h3 className="text-base font-semibold text-foreground mb-3">💡 Daily Tip</h3>
        <div className="bg-secondary rounded-2xl p-4">
          <p className="text-sm text-secondary-foreground leading-relaxed">
            {tips[Math.floor(Math.random() * tips.length)]}
          </p>
        </div>
      </section>
    </div>
  );
}
