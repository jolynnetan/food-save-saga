import { NavLink, useLocation } from "react-router-dom";
import { Home, Target, Camera, BarChart3, MoreHorizontal } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/challenges", icon: Target, label: "Challenges" },
  { to: "/scanner", icon: Camera, label: "Scan" },
  { to: "/tracker", icon: BarChart3, label: "Tracker" },
  { to: "/more", icon: MoreHorizontal, label: "More" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Highlight "More" tab when on sub-pages
  const moreRoutes = ["/more", "/pantry", "/share", "/shopping", "/portions", "/leaderboard"];
  const isMoreActive = moreRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍃</span>
          <h1 className="text-lg font-bold text-foreground tracking-tight">SavePlate</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1.5">
            <span className="text-sm">🔥</span>
            <span className="text-sm font-semibold text-secondary-foreground">7 days</span>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 rounded-full px-3 py-1.5">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-semibold text-primary">240 pts</span>
          </div>
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
