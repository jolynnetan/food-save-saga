import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Challenges from "@/pages/Challenges";
import Scanner from "@/pages/Scanner";
import Tracker from "@/pages/Tracker";
import Leaderboard from "@/pages/Leaderboard";
import More from "@/pages/More";
import Pantry from "@/pages/Pantry";
import Share from "@/pages/Share";
import ShoppingList from "@/pages/ShoppingList";
import PortionCalc from "@/pages/PortionCalc";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/more" element={<More />} />
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/share" element={<Share />} />
            <Route path="/shopping" element={<ShoppingList />} />
            <Route path="/portions" element={<PortionCalc />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
