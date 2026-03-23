import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import mascotBeginner from "@/assets/mascot-beginner.png";
import mascotSaver from "@/assets/mascot-saver.png";
import mascotHero from "@/assets/mascot-hero.png";
import mascotChampion from "@/assets/mascot-champion.png";
import mascotLegend from "@/assets/mascot-legend.png";

export type LevelInfo = {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  mascot: string;
  color: string;
  emoji: string;
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: "streak" | "waste" | "community" | "mastery";
};

export type DailyMission = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  completed: boolean;
  type: "use-expiring" | "log-meal" | "scan" | "challenge" | "pantry" | "share";
};

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Beginner", minXP: 0, maxXP: 100, mascot: mascotBeginner, color: "text-muted-foreground", emoji: "🌱" },
  { level: 2, title: "Saver", minXP: 100, maxXP: 300, mascot: mascotSaver, color: "text-primary", emoji: "🌿" },
  { level: 3, title: "Hero", minXP: 300, maxXP: 600, mascot: mascotHero, color: "text-warning", emoji: "👑" },
  { level: 4, title: "Champion", minXP: 600, maxXP: 1000, mascot: mascotChampion, color: "text-streak", emoji: "⚔️" },
  { level: 5, title: "Legend", minXP: 1000, maxXP: 2000, mascot: mascotLegend, color: "text-primary", emoji: "✨" },
];

const ALL_BADGES: Omit<Badge, "unlocked" | "unlockedAt">[] = [
  { id: "streak-5", title: "5-Day Streak", description: "Maintained a 5-day login streak", emoji: "🔥", icon: "flame", category: "streak" },
  { id: "streak-10", title: "10-Day Streak", description: "Maintained a 10-day login streak", emoji: "💪", icon: "zap", category: "streak" },
  { id: "streak-30", title: "30-Day Warrior", description: "30 consecutive days of saving food", emoji: "⚡", icon: "shield", category: "streak" },
  { id: "zero-waste-week", title: "Zero Waste Week", description: "7 days with no food wasted", emoji: "🏆", icon: "trophy", category: "waste" },
  { id: "meals-10", title: "10 Meals Saved", description: "Saved 10 meals from being wasted", emoji: "🍽️", icon: "utensils", category: "waste" },
  { id: "meals-50", title: "50 Meals Saved", description: "Half a century of meals rescued!", emoji: "🌟", icon: "star", category: "waste" },
  { id: "kg-5", title: "5kg Food Saver", description: "Saved 5kg of food from waste", emoji: "🥬", icon: "leaf", category: "waste" },
  { id: "pantry-master", title: "Pantry Master", description: "Used 10 items before expiry", emoji: "📦", icon: "package", category: "mastery" },
  { id: "first-scan", title: "First Scan", description: "Scanned your first food item", emoji: "📸", icon: "camera", category: "mastery" },
  { id: "recipe-explorer", title: "Recipe Explorer", description: "Tried 5 zero-waste recipes", emoji: "👨‍🍳", icon: "chef-hat", category: "mastery" },
  { id: "community-helper", title: "Community Helper", description: "Donated to a foodbank", emoji: "🤝", icon: "heart", category: "community" },
  { id: "food-sharer", title: "Food Sharer", description: "Shared food with neighbors 5 times", emoji: "🎁", icon: "gift", category: "community" },
  { id: "challenge-master", title: "Challenge Master", description: "Completed 20 challenges", emoji: "🎯", icon: "target", category: "mastery" },
  { id: "level-3", title: "Rising Hero", description: "Reached Hero level", emoji: "👑", icon: "crown", category: "mastery" },
  { id: "level-5", title: "Living Legend", description: "Reached Legend level", emoji: "🌟", icon: "sparkles", category: "mastery" },
];

const DAILY_MISSION_POOL: Omit<DailyMission, "id" | "completed">[] = [
  { title: "Use 1 expiring item", description: "Cook with something expiring soon", emoji: "⏰", xpReward: 15, type: "use-expiring" },
  { title: "Log a meal", description: "Track what you ate today", emoji: "📝", xpReward: 10, type: "log-meal" },
  { title: "Scan your fridge", description: "Check what needs to be used", emoji: "📸", xpReward: 10, type: "scan" },
  { title: "Complete 1 challenge", description: "Finish any daily challenge", emoji: "🎯", xpReward: 15, type: "challenge" },
  { title: "Update your pantry", description: "Add or remove pantry items", emoji: "📦", xpReward: 10, type: "pantry" },
  { title: "Share a tip", description: "Share a food-saving tip", emoji: "💡", xpReward: 20, type: "share" },
  { title: "Zero waste meal", description: "Make a meal with no waste", emoji: "♻️", xpReward: 20, type: "log-meal" },
  { title: "Check expiry dates", description: "Review items in your pantry", emoji: "📅", xpReward: 10, type: "pantry" },
];

function pickDailyMissions(): DailyMission[] {
  const today = new Date().toDateString();
  const saved = localStorage.getItem("sp-daily-missions");
  if (saved) {
    try {
      const { date, missions } = JSON.parse(saved);
      if (date === today) return missions;
    } catch {}
  }
  const shuffled = [...DAILY_MISSION_POOL].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3).map((m, i) => ({ ...m, id: `dm-${today}-${i}`, completed: false }));
  localStorage.setItem("sp-daily-missions", JSON.stringify({ date: today, missions: picked }));
  return picked;
}

type GamificationContextType = {
  xp: number;
  level: LevelInfo;
  xpProgress: number; // 0-100
  badges: Badge[];
  dailyMissions: DailyMission[];
  recentAchievements: { title: string; emoji: string; time: string }[];
  addXP: (amount: number, reason?: string) => void;
  completeMission: (missionId: string) => void;
  unlockBadge: (badgeId: string) => void;
  showConfetti: boolean;
  confettiMessage: string;
  dismissConfetti: () => void;
  gamificationEnabled: boolean;
  setGamificationEnabled: (v: boolean) => void;
  seasonalEvent: { title: string; emoji: string; endsIn: string } | null;
};

const GamificationContext = createContext<GamificationContextType | null>(null);

function getLevel(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

function getXPProgress(xp: number, level: LevelInfo): number {
  const range = level.maxXP - level.minXP;
  const progress = xp - level.minXP;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [xp, setXP] = useState(() => parseInt(localStorage.getItem("sp-xp") || "0", 10));
  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem("sp-badges");
    if (saved) try { return JSON.parse(saved); } catch {}
    return ALL_BADGES.map(b => ({ ...b, unlocked: false }));
  });
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(pickDailyMissions);
  const [recentAchievements, setRecentAchievements] = useState<{ title: string; emoji: string; time: string }[]>(() => {
    const saved = localStorage.getItem("sp-recent-achievements");
    if (saved) try { return JSON.parse(saved); } catch {}
    return [];
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMessage, setConfettiMessage] = useState("");
  const [gamificationEnabled, setGamificationEnabled] = useState(() => {
    return localStorage.getItem("sp-gamification") !== "false";
  });

  const level = getLevel(xp);
  const xpProgress = getXPProgress(xp, level);

  useEffect(() => { localStorage.setItem("sp-xp", String(xp)); }, [xp]);
  useEffect(() => { localStorage.setItem("sp-badges", JSON.stringify(badges)); }, [badges]);
  useEffect(() => { localStorage.setItem("sp-gamification", String(gamificationEnabled)); }, [gamificationEnabled]);
  useEffect(() => {
    localStorage.setItem("sp-recent-achievements", JSON.stringify(recentAchievements.slice(0, 10)));
  }, [recentAchievements]);

  const triggerConfetti = useCallback((msg: string) => {
    setConfettiMessage(msg);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const addXP = useCallback((amount: number, reason?: string) => {
    setXP(prev => {
      const newXP = prev + amount;
      const oldLevel = getLevel(prev);
      const newLevel = getLevel(newXP);
      if (newLevel.level > oldLevel.level) {
        triggerConfetti(`🎉 Level Up! You're now a ${newLevel.title}!`);
        setRecentAchievements(ra => [{ title: `Reached ${newLevel.title}`, emoji: newLevel.emoji, time: new Date().toISOString() }, ...ra]);
      }
      return newXP;
    });
    if (reason) {
      setRecentAchievements(ra => [{ title: reason, emoji: "⭐", time: new Date().toISOString() }, ...ra].slice(0, 10));
    }
  }, [triggerConfetti]);

  const completeMission = useCallback((missionId: string) => {
    setDailyMissions(prev => {
      const updated = prev.map(m => {
        if (m.id === missionId && !m.completed) {
          addXP(m.xpReward, m.title);
          return { ...m, completed: true };
        }
        return m;
      });
      const today = new Date().toDateString();
      localStorage.setItem("sp-daily-missions", JSON.stringify({ date: today, missions: updated }));
      return updated;
    });
  }, [addXP]);

  const unlockBadge = useCallback((badgeId: string) => {
    setBadges(prev => {
      const badge = prev.find(b => b.id === badgeId);
      if (!badge || badge.unlocked) return prev;
      triggerConfetti(`🏅 Badge Unlocked: ${badge.title}!`);
      setRecentAchievements(ra => [{ title: badge.title, emoji: badge.emoji, time: new Date().toISOString() }, ...ra].slice(0, 10));
      return prev.map(b => b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toISOString() } : b);
    });
  }, [triggerConfetti]);

  // Auto-check badge unlocks based on streak/xp
  useEffect(() => {
    const streak = parseInt(localStorage.getItem("sp-streak") || "0", 10);
    if (streak >= 5) unlockBadge("streak-5");
    if (streak >= 10) unlockBadge("streak-10");
    if (streak >= 30) unlockBadge("streak-30");
    if (level.level >= 3) unlockBadge("level-3");
    if (level.level >= 5) unlockBadge("level-5");
  }, [xp, level, unlockBadge]);

  // Seasonal event (simulated)
  const seasonalEvent = (() => {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    if (dayOfYear % 30 < 7) {
      const daysLeft = 7 - (dayOfYear % 30);
      return { title: "Zero Waste Challenge Week", emoji: "🌍", endsIn: `${daysLeft} days left` };
    }
    return null;
  })();

  return (
    <GamificationContext.Provider value={{
      xp, level, xpProgress, badges, dailyMissions, recentAchievements,
      addXP, completeMission, unlockBadge,
      showConfetti, confettiMessage, dismissConfetti: () => setShowConfetti(false),
      gamificationEnabled, setGamificationEnabled, seasonalEvent,
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("useGamification must be used within GamificationProvider");
  return ctx;
}
