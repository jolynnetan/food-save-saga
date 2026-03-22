import { useState } from "react";
import { Gift, Check, Lock, Star, Heart, TreePine, Utensils, Award, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Reward = {
  id: number;
  title: string;
  description: string;
  emoji: string;
  cost: number;
  category: "donate" | "personal" | "eco";
  redeemed: boolean;
};

const rewards: Reward[] = [
  { id: 1, title: "Donate a Meal", emoji: "🍱", description: "A meal donated to a foodbank in your name", cost: 500, category: "donate", redeemed: false },
  { id: 2, title: "Plant a Tree", emoji: "🌳", description: "We plant a tree through our NGO partner on your behalf", cost: 1000, category: "eco", redeemed: false },
  { id: 3, title: "Foodbank Restock", emoji: "🏪", description: "Donate food supplies to a local foodbank in your name", cost: 1500, category: "donate", redeemed: false },
  { id: 4, title: "Reusable Container Set", emoji: "♻️", description: "Earn a set of eco-friendly food containers", cost: 2000, category: "eco", redeemed: false },
  { id: 5, title: "Premium Recipe Pack", emoji: "👨‍🍳", description: "Unlock 20 exclusive zero-waste chef recipes", cost: 300, category: "personal", redeemed: false },
  { id: 6, title: "Feed a Family", emoji: "👨‍👩‍👧‍👦", description: "Sponsor a week of meals for a family in need", cost: 3000, category: "donate", redeemed: false },
  { id: 7, title: "Compost Starter Kit", emoji: "🌱", description: "Get a home composting starter kit delivered", cost: 1200, category: "eco", redeemed: false },
  { id: 8, title: "Food Saver Badge", emoji: "🏅", description: "Exclusive profile badge visible on leaderboard", cost: 800, category: "personal", redeemed: false },
  { id: 9, title: "Community Garden Pass", emoji: "🌻", description: "1-month access to a local community garden", cost: 2500, category: "eco", redeemed: false },
  { id: 10, title: "Cooking Class Voucher", emoji: "🍳", description: "Free online zero-waste cooking class", cost: 1800, category: "personal", redeemed: false },
];

const categories = [
  { key: "all" as const, label: "All", icon: Sparkles },
  { key: "donate" as const, label: "Donate", icon: Heart },
  { key: "eco" as const, label: "Eco", icon: TreePine },
  { key: "personal" as const, label: "Personal", icon: Star },
];

export default function Rewards() {
  const [userPoints] = useState(1240);
  const [redeemedIds, setRedeemedIds] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<"all" | "donate" | "personal" | "eco">("all");
  const { toast } = useToast();

  const handleRedeem = (reward: Reward) => {
    if (userPoints < reward.cost) {
      toast({ title: "Not enough points", description: `You need ${reward.cost - userPoints} more points to redeem this reward.`, variant: "destructive" });
      return;
    }
    setRedeemedIds((prev) => [...prev, reward.id]);
    toast({ title: "🎉 Reward Redeemed!", description: `You redeemed "${reward.title}" for ${reward.cost} pts.` });
  };

  const filtered = activeCategory === "all" ? rewards : rewards.filter((r) => r.category === activeCategory);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Rewards</h2>
        <p className="text-muted-foreground mt-1">Redeem your points for real impact</p>
      </div>

      {/* Points balance */}
      <div
        className="relative overflow-hidden bg-primary rounded-2xl p-5 text-primary-foreground animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Your Balance</p>
            <p className="text-3xl font-bold tabular-nums mt-0.5">{userPoints.toLocaleString()}</p>
            <p className="text-xs opacity-70 mt-1">points available</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-3">
            <Gift size={28} />
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 animate-fade-up" style={{ animationDelay: "160ms" }}>
        {categories.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
              activeCategory === key
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Rewards list */}
      <div className="space-y-3">
        {filtered.map((reward, i) => {
          const isRedeemed = redeemedIds.includes(reward.id);
          const canAfford = userPoints >= reward.cost;

          return (
            <div
              key={reward.id}
              className={`bg-card border rounded-2xl p-4 transition-all duration-200 animate-fade-up ${
                isRedeemed ? "opacity-50" : ""
              }`}
              style={{ animationDelay: `${240 + i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{reward.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{reward.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{reward.description}</p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full tabular-nums">
                      {reward.cost.toLocaleString()} pts
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      reward.category === "donate"
                        ? "bg-warning/10 text-warning"
                        : reward.category === "eco"
                        ? "bg-success/10 text-success"
                        : "bg-accent/10 text-accent"
                    }`}>
                      {reward.category === "donate" ? "Donation" : reward.category === "eco" ? "Eco Impact" : "Personal"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRedeem(reward)}
                  disabled={isRedeemed || !canAfford}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.95] ${
                    isRedeemed
                      ? "bg-success/10 text-success cursor-default"
                      : canAfford
                      ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isRedeemed ? (
                    <><Check size={14} /> Done</>
                  ) : canAfford ? (
                    <><Gift size={14} /> Redeem</>
                  ) : (
                    <><Lock size={14} /> Locked</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
