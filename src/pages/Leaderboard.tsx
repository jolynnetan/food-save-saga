import { Medal, TrendingUp } from "lucide-react";

const leaderboard = [
  { rank: 1, name: "Aisyah Rahman", pts: 2340, saved: "12.4 kg", streak: 21, avatar: "🧕" },
  { rank: 2, name: "Wei Jie Tan", pts: 1980, saved: "10.1 kg", streak: 14, avatar: "👨" },
  { rank: 3, name: "Priya Nair", pts: 1750, saved: "8.7 kg", streak: 18, avatar: "👩" },
  { rank: 4, name: "You", pts: 1240, saved: "5.2 kg", streak: 7, avatar: "🙋", isUser: true },
  { rank: 5, name: "Ahmad Faiz", pts: 1180, saved: "5.0 kg", streak: 9, avatar: "👦" },
  { rank: 6, name: "Mei Ling Chow", pts: 990, saved: "4.3 kg", streak: 5, avatar: "👧" },
  { rank: 7, name: "Ravi Kumar", pts: 870, saved: "3.8 kg", streak: 4, avatar: "👨‍🦱" },
  { rank: 8, name: "Sarah Lee", pts: 720, saved: "2.9 kg", streak: 3, avatar: "👩‍🦰" },
];

const medalColors = ["", "text-yellow-500", "text-gray-400", "text-amber-600"];

export default function Leaderboard() {
  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Leaderboard</h2>
        <p className="text-muted-foreground mt-1">See who's saving the most food this month</p>
      </div>

      {/* Top 3 podium */}
      <div className="flex items-end justify-center gap-3 pt-4 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {[leaderboard[1], leaderboard[0], leaderboard[2]].map((user, i) => {
          const heights = ["h-20", "h-28", "h-16"];
          const sizes = ["text-3xl", "text-4xl", "text-3xl"];
          return (
            <div key={user.rank} className="flex flex-col items-center gap-2">
              <span className={sizes[i]}>{user.avatar}</span>
              <p className="text-xs font-semibold text-foreground text-center leading-tight max-w-[72px] truncate">
                {user.name}
              </p>
              <div className={`${heights[i]} w-20 rounded-t-xl flex flex-col items-center justify-end pb-2 ${
                i === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                <Medal size={16} className={i === 1 ? "" : medalColors[user.rank]} />
                <span className="text-sm font-bold tabular-nums">{user.pts}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
      <div className="space-y-2">
        {leaderboard.slice(3).map((user, i) => (
          <div
            key={user.rank}
            className={`flex items-center gap-3 rounded-xl p-3 border transition-all animate-fade-up ${
              (user as any).isUser
                ? "bg-primary/5 border-primary/20 shadow-sm"
                : "bg-card"
            }`}
            style={{ animationDelay: `${160 + i * 60}ms` }}
          >
            <span className="text-sm font-bold text-muted-foreground w-6 text-center tabular-nums">
              {user.rank}
            </span>
            <span className="text-xl">{user.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${(user as any).isUser ? "text-primary" : "text-foreground"}`}>
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.saved} saved · 🔥 {user.streak} days
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground tabular-nums">{user.pts}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                <TrendingUp size={10} className="text-success" /> pts
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
