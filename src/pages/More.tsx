import { Link } from "react-router-dom";
import { Package, MapPin, ShoppingCart, Calculator, Settings, Trophy, ChefHat, Flame, Clock, BarChart3 } from "lucide-react";

const features = [
  { to: "/pantry", icon: Package, emoji: "🥗", title: "Smart Pantry", color: "text-primary", bg: "bg-primary/10" },
  { to: "/share", icon: MapPin, emoji: "📍", title: "Food Drop", color: "text-warning", bg: "bg-warning/10" },
  { to: "/shopping", icon: ShoppingCart, emoji: "📉", title: "Smart Shopping", color: "text-success", bg: "bg-success/10" },
  { to: "/portions", icon: Calculator, emoji: "🍱", title: "Portions", color: "text-earth", bg: "bg-earth/10" },
  { to: "/calories", icon: Flame, emoji: "🔥", title: "Calories", color: "text-streak", bg: "bg-streak/10" },
  { to: "/history", icon: Clock, emoji: "📜", title: "History", color: "text-accent", bg: "bg-accent/10" },
  { to: "/leaderboard", icon: Trophy, emoji: "🏆", title: "Leaderboard", color: "text-streak", bg: "bg-streak/10" },
  { to: "/recipes", icon: ChefHat, emoji: "👨‍🍳", title: "Recipes", color: "text-accent", bg: "bg-accent/10" },
  { to: "/weekly-report", icon: BarChart3, emoji: "📊", title: "Weekly Report", color: "text-primary", bg: "bg-primary/10" },
  { to: "/settings", icon: Settings, emoji: "⚙️", title: "Settings", color: "text-muted-foreground", bg: "bg-muted" },
];

export default function More() {
  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">More Tools</h2>
        <p className="text-muted-foreground mt-1">Everything to fight food waste</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {features.map((f, i) => (
          <Link
            key={f.to}
            to={f.to}
            className="flex flex-col items-center gap-2 bg-card border rounded-2xl p-4 transition-all duration-200 active:scale-[0.95] hover:shadow-md animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 60}ms` }}
          >
            <div className={`${f.bg} rounded-2xl p-4`}>
              <f.icon className={f.color} size={28} />
            </div>
            <span className="text-xs font-semibold text-foreground text-center leading-tight">{f.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
