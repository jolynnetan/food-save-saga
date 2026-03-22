import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Challenges from "@/pages/Challenges";
import Scanner from "@/pages/Scanner";
import Tracker from "@/pages/Tracker";
import Leaderboard from "@/pages/Leaderboard";
import More from "@/pages/More";
import CalorieTracker from "@/pages/CalorieTracker";
import History from "@/pages/History";
import Pantry from "@/pages/Pantry";
import Share from "@/pages/Share";
import ShoppingList from "@/pages/ShoppingList";
import PortionCalc from "@/pages/PortionCalc";
import Settings from "@/pages/Settings";
import Friends from "@/pages/Friends";
import RecipeGuide from "@/pages/RecipeGuide";
import WeeklyReport from "@/pages/WeeklyReport";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <span className="text-4xl">🍃</span>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/tracker" element={<Tracker />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/calories" element={<CalorieTracker />} />
        <Route path="/history" element={<History />} />
        <Route path="/more" element={<More />} />
        <Route path="/pantry" element={<Pantry />} />
        <Route path="/share" element={<Share />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/portions" element={<PortionCalc />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/recipes" element={<RecipeGuide />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
