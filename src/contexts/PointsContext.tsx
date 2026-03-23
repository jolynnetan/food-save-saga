import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

type PointsContextType = {
  points: number;
  streak: number;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => boolean;
};

const PointsContext = createContext<PointsContextType | null>(null);

function calculateStreak(): number {
  const lastLogin = localStorage.getItem("sp-last-login");
  const streakCount = parseInt(localStorage.getItem("sp-streak") || "0", 10);
  const today = new Date().toDateString();

  if (lastLogin === today) return streakCount;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastLogin === yesterday.toDateString()) {
    const newStreak = streakCount + 1;
    localStorage.setItem("sp-streak", String(newStreak));
    localStorage.setItem("sp-last-login", today);
    return newStreak;
  }

  // Streak broken or first login
  localStorage.setItem("sp-streak", "1");
  localStorage.setItem("sp-last-login", today);
  return 1;
}

export function PointsProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(() => {
    return parseInt(localStorage.getItem("sp-points") || "240", 10);
  });
  const [streak] = useState(() => calculateStreak());

  useEffect(() => {
    localStorage.setItem("sp-points", String(points));
  }, [points]);

  const addPoints = useCallback((amount: number) => {
    setPoints((p) => p + amount);
  }, []);

  const spendPoints = useCallback((amount: number): boolean => {
    let success = false;
    setPoints((p) => {
      if (p >= amount) {
        success = true;
        return p - amount;
      }
      return p;
    });
    return success;
  }, []);

  return (
    <PointsContext.Provider value={{ points, streak, addPoints, spendPoints }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const ctx = useContext(PointsContext);
  if (!ctx) throw new Error("usePoints must be used within PointsProvider");
  return ctx;
}
