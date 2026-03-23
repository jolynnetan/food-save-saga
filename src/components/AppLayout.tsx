import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Camera, MoreHorizontal, ArrowLeft, Settings, Sparkles, ChefHat, Flame } from "lucide-react";
import { usePoints } from "@/contexts/PointsContext";
import GlobalSearch from "@/components/GlobalSearch";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/challenges", icon: Flame, label: "Challenges" },
  { to: "/scanner", icon: Camera, label: "Scan" },
  { to: "/recipes", icon: ChefHat, label: "Recipes" },
  { to: "/more", icon: MoreHorizontal, label: "More" },
];

const mainRoutes = ["/", "/challenges", "/scanner", "/recipes", "/more"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { points, streak } = usePoints();

  const isSubPage = !mainRoutes.includes(location.pathname);

  const moreRoutes = ["/more", "/pantry", "/share", "/shopping", "/portions", "/leaderboard", "/settings", "/friends", "/history", "/weekly-report", "/tracker", "/calories", "/foodbank", "/rewards", "/reminders"];
  const isMoreActive = moreRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSubPage ? (
            <button
              onClick={() => navigate(-1)}
              className="p-1 -ml-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
          ) : (
            <span className="text-2xl">🍃</span>
          )}
          <h1 className="text-lg font-bold text-foreground tracking-tight">SavePlate</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5">
            <span className="text-sm">🔥</span>
            <span className="text-sm font-semibold text-secondary-foreground tabular-nums">{streak} days</span>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1.5">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-semibold text-primary tabular-nums">{points} pts</span>
          </div>
          <button
            onClick={() => navigate("/ai-assistant")}
            className="p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
          >
            <Sparkles size={20} className="text-purple-500" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Settings size={20} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === "/more" ? isMoreActive : location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
