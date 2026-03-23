import { useState } from "react";
import { Medal, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { usePoints } from "@/contexts/PointsContext";
import { useGamification, LEVELS } from "@/contexts/GamificationContext";

const weeklyLeaderboard = [
  { rank: 1, name: "Aisyah Rahman", pts: 2340, saved: "12.4 kg", streak: 21, avatar: "🧕", level: 4 },
  { rank: 2, name: "Wei Jie Tan", pts: 1980, saved: "10.1 kg", streak: 14, avatar: "👨", level: 4 },
  { rank: 3, name: "Priya Nair", pts: 1750, saved: "8.7 kg", streak: 18, avatar: "👩", level: 3 },
  { rank: 5, name: "Ahmad Faiz", pts: 1180, saved: "5.0 kg", streak: 9, avatar: "👦", level: 3 },
  { rank: 6, name: "Mei Ling Chow", pts: 990, saved: "4.3 kg", streak: 5, avatar: "👧", level: 2 },
  { rank: 7, name: "Ravi Kumar", pts: 870, saved: "3.8 kg", streak: 4, avatar: "👨‍🦱", level: 2 },
  { rank: 8, name: "Sarah Lee", pts: 720, saved: "2.9 kg", streak: 3, avatar: "👩‍🦰", level: 2 },
  { rank: 9, name: "Hafiz Zain", pts: 560, saved: "2.1 kg", streak: 2, avatar: "👨‍🦳", level: 1 },
  { rank: 10, name: "Siti Aminah", pts: 430, saved: "1.8 kg", streak: 1, avatar: "👵", level: 1 },
];

const allTimeLeaderboard = [
  { rank: 1, name: "Aisyah Rahman", pts: 15200, saved: "82 kg", streak: 45, avatar: "🧕", level: 5 },
  { rank: 2, name: "Wei Jie Tan", pts: 12800, saved: "64 kg", streak: 38, avatar: "👨", level: 5 },
  { rank: 3, name: "Priya Nair", pts: 9500, saved: "48 kg", streak: 30, avatar: "👩", level: 4 },
  { rank: 4, name: "Ahmad Faiz", pts: 7200, saved: "36 kg", streak: 25, avatar: "👦", level: 4 },
  { rank: 5, name: "Mei Ling Chow", pts: 5800, saved: "29 kg", streak: 20, avatar: "👧", level: 3 },
  { rank: 6, name: "Ravi Kumar", pts: 4100, saved: "21 kg", streak: 15, avatar: "👨‍🦱", level: 3 },
  { rank: 7, name: "Sarah Lee", pts: 3200, saved: "16 kg", streak: 12, avatar: "👩‍🦰", level: 3 },
];

export default function Leaderboard() {
  const { points, streak } = usePoints();
  const { level, xp } = useGamification();
  const [tab, setTab] = useState<"weekly" | "alltime">("weekly");

  const baseData = tab === "weekly" ? weeklyLeaderboard : allTimeLeaderboard;
  const userPts = tab === "weekly" ? points : xp;
  const userEntry = { rank: 0, name: "You", pts: userPts, saved: `${(userPts / 238).toFixed(1)} kg`, streak, avatar: "🙋", isUser: true, level: level.level };
  const allEntries = [...baseData, userEntry]
    .sort((a, b) => b.pts - a.pts)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  // Weekly reset info
  const now = new Date();
  const daysUntilReset = 7 - now.getDay();

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Leaderboard</h2>
        <p className="text-muted-foreground mt-1">Compete with fellow food savers</p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-muted rounded-xl p-1 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <button
          onClick={() => setTab("weekly")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            tab === "weekly" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          <Calendar size={14} /> This Week
        </button>
        <button
          onClick={() => setTab("alltime")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            tab === "alltime" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          <Trophy size={14} /> All Time
        </button>
      </div>

      {/* Reset timer */}
      {tab === "weekly" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl px-3 py-2 animate-fade-up" style={{ animationDelay: "80ms" }}>
          <RefreshCw size={12} />
          <span>Resets in {daysUntilReset} day{daysUntilReset !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-3 pt-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
        {[allEntries[1], allEntries[0], allEntries[2]].map((user, i) => {
          const heights = ["h-20", "h-28", "h-16"];
          const sizes = ["text-3xl", "text-4xl", "text-3xl"];
          const levelInfo = LEVELS[Math.min((user as any).level - 1, LEVELS.length - 1)] || LEVELS[0];
          return (
            <div key={user.rank} className="flex flex-col items-center gap-2">
              <div className="relative">
                <span className={sizes[i]}>{user.avatar}</span>
                <span className="absolute -bottom-1 -right-1 text-xs">{levelInfo.emoji}</span>
              </div>
              <p className="text-xs font-semibold text-foreground text-center leading-tight max-w-[72px] truncate">
                {user.name}
              </p>
              <div className={`${heights[i]} w-20 rounded-t-xl flex flex-col items-center justify-end pb-2 ${
                i === 1 ? "gradient-primary text-primary-foreground shadow-primary-glow" : "bg-muted text-foreground"
              }`}>
                <Medal size={16} className={i === 1 ? "" : i === 0 ? "text-muted-foreground" : "text-warning"} />
                <span className="text-sm font-bold tabular-nums">{user.pts.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {allEntries.slice(3).map((user, i) => {
          const levelInfo = LEVELS[Math.min((user as any).level - 1, LEVELS.length - 1)] || LEVELS[0];
          return (
            <div
              key={user.rank}
              className={`flex items-center gap-3 rounded-2xl p-3 border transition-all animate-fade-up ${
                (user as any).isUser
                  ? "bg-primary/5 border-primary/20 shadow-soft-sm"
                  : "bg-card border-border"
              }`}
              style={{ animationDelay: `${160 + i * 60}ms` }}
            >
              <span className="text-sm font-bold text-muted-foreground w-6 text-center tabular-nums">
                {user.rank}
              </span>
              <div className="relative">
                <span className="text-xl">{user.avatar}</span>
                <span className="absolute -bottom-0.5 -right-0.5 text-[10px]">{levelInfo.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${(user as any).isUser ? "text-primary" : "text-foreground"}`}>
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.saved} saved · 🔥 {user.streak} days · {levelInfo.title}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground tabular-nums">{user.pts.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                  <TrendingUp size={10} className="text-success" /> pts
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
