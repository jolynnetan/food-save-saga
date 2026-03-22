import { Link } from "react-router-dom";
import { Package, MapPin, ShoppingCart, Calculator, Settings, Trophy, ChefHat, ChevronRight, Flame, Clock, BarChart3 } from "lucide-react";

const features = [
  {
    to: "/pantry",
    icon: Package,
    emoji: "🥗",
    title: "Smart Pantry",
    description: "Track expiry dates, get recipe alerts before food goes bad",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    to: "/share",
    icon: MapPin,
    emoji: "📍",
    title: "Food Drop",
    description: "Share surplus food with neighbors on a local map",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    to: "/shopping",
    icon: ShoppingCart,
    emoji: "📉",
    title: "Smart Shopping",
    description: "Waste-aware shopping list that learns your habits",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    to: "/portions",
    icon: Calculator,
    emoji: "🍱",
    title: "Portion Calculator",
    description: "Calculate exact ingredients for zero leftovers",
    color: "text-earth",
    bg: "bg-earth/10",
  },
  {
    to: "/calories",
    icon: Flame,
    emoji: "🔥",
    title: "Calorie Tracker",
    description: "Log meals, track macros and weekly nutrition trends",
    color: "text-streak",
    bg: "bg-streak/10",
  },
  {
    to: "/history",
    icon: Clock,
    emoji: "📜",
    title: "History",
    description: "Review past meals and redo your favorite recipes",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    to: "/leaderboard",
    icon: Trophy,
    emoji: "🏆",
    title: "Leaderboard",
    description: "See how you rank among other food savers",
    color: "text-streak",
    bg: "bg-streak/10",
  },
  {
    to: "/recipes",
    icon: ChefHat,
    emoji: "👨‍🍳",
    title: "Recipe Guide",
    description: "Step-by-step recipes with calorie breakdown",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    to: "/weekly-report",
    icon: BarChart3,
    emoji: "📊",
    title: "Weekly Report",
    description: "Nutrition summary & food waste progress",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    to: "/settings",
    icon: Settings,
    emoji: "⚙️",
    title: "Settings",
    description: "Language, theme, font size & friends",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
];

export default function More() {
  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">More Tools</h2>
        <p className="text-muted-foreground mt-1">Everything to fight food waste</p>
      </div>

      <div className="space-y-3">
        {features.map((f, i) => (
          <Link
            key={f.to}
            to={f.to}
            className="flex items-center gap-4 bg-card border rounded-2xl p-4 transition-all duration-200 active:scale-[0.97] animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className={`${f.bg} rounded-xl p-3`}>
              <f.icon className={f.color} size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{f.emoji} {f.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
