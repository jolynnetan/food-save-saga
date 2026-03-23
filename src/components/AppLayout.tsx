import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Camera, MoreHorizontal, ArrowLeft, Settings, Sparkles, ChefHat, Flame } from "lucide-react";
import { usePoints } from "@/contexts/PointsContext";
import GlobalSearch from "@/components/GlobalSearch";
import AiChatPopup from "@/components/AiChatPopup";

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
  const [aiOpen, setAiOpen] = useState(false);

  const isSubPage = !mainRoutes.includes(location.pathname);

  const moreRoutes = ["/more", "/pantry", "/share", "/shopping", "/portions", "/leaderboard", "/settings", "/friends", "/history", "/weekly-report", "/tracker", "/calories", "/foodbank", "/rewards", "/reminders", "/achievements", "/journey"];
  const isMoreActive = moreRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen gradient-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isSubPage ? (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 -ml-1 rounded-xl hover:bg-muted transition-all duration-200 btn-press"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-primary-glow">
                <span className="text-lg">🍃</span>
              </div>
            </div>
          )}
          <h1 className="text-lg font-bold text-foreground tracking-tight">SavePlate</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-streak/10 rounded-full px-3 py-1.5 border border-streak/20">
            <span className="text-sm">🔥</span>
            <span className="text-sm font-semibold text-streak tabular-nums">{streak}</span>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1.5 border border-primary/20">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-semibold text-primary tabular-nums">{points}</span>
          </div>
          <GlobalSearch />
          <button
            onClick={() => setAiOpen(prev => !prev)}
            className={`p-2 rounded-xl transition-all duration-200 btn-press ${aiOpen ? "gradient-primary text-primary-foreground shadow-primary-glow" : "hover:bg-primary/10 text-primary"}`}
          >
            <Sparkles size={18} />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-xl hover:bg-muted transition-all duration-200 btn-press"
          >
            <Settings size={18} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* AI Chat Popup */}
      <AiChatPopup open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Main content */}
      <main className="flex-1 pb-24 overflow-y-auto animate-page-enter">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t">
        <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === "/more" ? isMoreActive : location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-300 btn-press ${
                  isActive
                    ? "text-primary-foreground gradient-primary shadow-primary-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold">{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
