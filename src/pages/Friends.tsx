import { useState } from "react";
import { UserPlus, Trophy, Flame, Leaf, Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useT } from "@/contexts/SettingsContext";

type Friend = {
  id: number;
  name: string;
  avatar: string;
  streak: number;
  savedKg: number;
  rank: number;
  status: "active" | "away";
  lastActive: string;
};

const mockFriends: Friend[] = [
  { id: 1, name: "Sarah M.", avatar: "S", streak: 14, savedKg: 8.2, rank: 3, status: "active", lastActive: "Just now" },
  { id: 2, name: "Amir K.", avatar: "A", streak: 21, savedKg: 12.5, rank: 1, status: "active", lastActive: "2h ago" },
  { id: 3, name: "Lin T.", avatar: "L", streak: 7, savedKg: 4.1, rank: 8, status: "away", lastActive: "1d ago" },
  { id: 4, name: "Ravi P.", avatar: "R", streak: 10, savedKg: 6.8, rank: 5, status: "active", lastActive: "30m ago" },
  { id: 5, name: "Mei W.", avatar: "M", streak: 3, savedKg: 1.9, rank: 15, status: "away", lastActive: "3d ago" },
  { id: 6, name: "James O.", avatar: "J", streak: 28, savedKg: 15.3, rank: 2, status: "active", lastActive: "5m ago" },
];

export default function Friends() {
  const t = useT();
  const [search, setSearch] = useState("");

  const filtered = mockFriends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const topSaver = mockFriends.reduce((a, b) => (a.savedKg > b.savedKg ? a : b));

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-up">
        <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground text-balance">{t("friends")}</h2>
          <p className="text-muted-foreground mt-1">{t("friendsDesc")}</p>
        </div>
        <button className="bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.9]">
          <UserPlus size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="relative animate-fade-up" style={{ animationDelay: "60ms" }}>
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends..."
          className="w-full bg-muted rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Top saver highlight */}
      <div className="bg-secondary rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-lg font-bold text-warning">
            {topSaver.avatar}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">🏆 {topSaver.name} is the top saver!</p>
            <p className="text-xs text-muted-foreground">{topSaver.savedKg} kg saved · {topSaver.streak} day streak</p>
          </div>
        </div>
      </div>

      {/* Friends list */}
      <section className="space-y-2 animate-fade-up" style={{ animationDelay: "180ms" }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {filtered.length} {t("friends")}
        </h3>
        {filtered.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 bg-card border rounded-xl p-3 transition-all duration-200"
          >
            {/* Avatar */}
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                friend.status === "active"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {friend.avatar}
              </div>
              {friend.status === "active" && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{friend.name}</p>
              <p className="text-xs text-muted-foreground">{friend.lastActive}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-streak font-medium">
                <Flame size={12} /> {friend.streak}
              </span>
              <span className="flex items-center gap-1 text-primary font-medium">
                <Leaf size={12} /> {friend.savedKg}kg
              </span>
              <span className="flex items-center gap-1 text-warning font-semibold">
                <Trophy size={12} /> #{friend.rank}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">No friends found</p>
          </div>
        )}
      </section>

      {/* Invite CTA */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 text-center animate-fade-up" style={{ animationDelay: "240ms" }}>
        <p className="text-sm font-medium text-foreground mb-2">Invite friends to SavePlate</p>
        <p className="text-xs text-muted-foreground mb-3">Save food together and compete on the leaderboard!</p>
        <button className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97]">
          Share Invite Link
        </button>
      </div>
    </div>
  );
}
