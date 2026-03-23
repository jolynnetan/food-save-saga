import { useState, useEffect, useCallback } from "react";
import { Flame, Calendar, Star, Gift, Check, Lock, Heart, TreePine, Sparkles, ShoppingBag, X, FileText, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePoints } from "@/contexts/PointsContext";

type Challenge = {
  id: number;
  title: string;
  description: string;
  emoji: string;
  pts: number;
  done: boolean;
  category: "daily" | "weekly" | "monthly";
};

type Reward = {
  id: number;
  title: string;
  description: string;
  emoji: string;
  cost: number;
  category: "donate" | "personal" | "eco" | "voucher";
  terms?: string;
  voucherCode?: string;
};

const initialChallenges: Challenge[] = [
  { id: 1, title: "Finish yesterday's rice", description: "Don't let cooked rice go to waste", emoji: "🍚", pts: 10, done: false, category: "daily" },
  { id: 2, title: "Plan meals for the week", description: "Create a meal plan to avoid over-buying", emoji: "📋", pts: 15, done: false, category: "daily" },
  { id: 3, title: "Use wilting vegetables", description: "Cook with veggies before they go bad", emoji: "🥬", pts: 20, done: false, category: "daily" },
  { id: 4, title: "Zero waste lunch", description: "Prepare a lunch with no food waste", emoji: "🥗", pts: 15, done: false, category: "daily" },
  { id: 5, title: "5 zero-waste days", description: "Go 5 consecutive days without wasting food", emoji: "🏆", pts: 100, done: false, category: "weekly" },
  { id: 6, title: "Try 3 leftover recipes", description: "Cook 3 meals using only leftovers", emoji: "👨‍🍳", pts: 75, done: false, category: "weekly" },
  { id: 7, title: "Reduce grocery bill 10%", description: "Spend less by buying only what you need", emoji: "💰", pts: 50, done: false, category: "weekly" },
  { id: 8, title: "30-day no waste streak", description: "An entire month without food waste", emoji: "🌟", pts: 500, done: false, category: "monthly" },
  { id: 9, title: "Compost challenge", description: "Start composting your food scraps", emoji: "🌱", pts: 200, done: false, category: "monthly" },
];

const rewardsList: Reward[] = [
  { id: 1, title: "Donate a Meal", emoji: "🍱", description: "A meal donated to a foodbank in your name", cost: 500, category: "donate" },
  { id: 2, title: "Plant a Tree", emoji: "🌳", description: "We plant a tree through our NGO partner", cost: 1000, category: "eco" },
  { id: 3, title: "Foodbank Restock", emoji: "🏪", description: "Donate supplies to a local foodbank", cost: 1500, category: "donate" },
  { id: 4, title: "Reusable Container Set", emoji: "♻️", description: "Eco-friendly food containers", cost: 2000, category: "eco" },
  { id: 5, title: "Premium Recipe Pack", emoji: "👨‍🍳", description: "20 exclusive zero-waste recipes", cost: 300, category: "personal" },
  { id: 6, title: "Feed a Family", emoji: "👨‍👩‍👧‍👦", description: "Sponsor a week of meals for a family", cost: 3000, category: "donate" },
  { id: 7, title: "Food Saver Badge", emoji: "🏅", description: "Exclusive profile badge", cost: 800, category: "personal" },
  {
    id: 11, title: "RM10 Grocery Voucher", emoji: "🛒", description: "RM10 off at participating stores", cost: 1500, category: "voucher",
    terms: "Valid for 30 days from redemption. Minimum purchase of RM50. Valid at participating stores only. Not combinable with other promotions. One voucher per transaction.",
    voucherCode: "FOOD-SAVE-10",
  },
  {
    id: 12, title: "RM5 Eco Market Voucher", emoji: "🥬", description: "RM5 off at eco-friendly markets", cost: 800, category: "voucher",
    terms: "Valid for 14 days from redemption. No minimum purchase required. Valid at participating eco markets only. Cannot be exchanged for cash.",
    voucherCode: "ECO-MKT-5",
  },
  {
    id: 13, title: "Free Delivery Voucher", emoji: "🚚", description: "Free delivery on grocery order", cost: 600, category: "voucher",
    terms: "Valid for 7 days from redemption. Minimum order of RM30. Delivery within city limits only. One use per account.",
    voucherCode: "FREE-DLVR",
  },
  {
    id: 14, title: "RM25 Meal Kit Voucher", emoji: "📦", description: "RM25 off a zero-waste meal kit", cost: 3500, category: "voucher",
    terms: "Valid for 60 days from redemption. First-time subscription only. Cannot be used with other discounts.",
    voucherCode: "MEALKIT-25",
  },
];

const challengeTabs = [
  { key: "daily" as const, label: "Daily", icon: Flame },
  { key: "weekly" as const, label: "Weekly", icon: Calendar },
  { key: "monthly" as const, label: "Monthly", icon: Star },
];

const rewardCategories = [
  { key: "all" as const, label: "All", icon: Sparkles },
  { key: "donate" as const, label: "Donate", icon: Heart },
  { key: "eco" as const, label: "Eco", icon: TreePine },
  { key: "voucher" as const, label: "Vouchers", icon: ShoppingBag },
];

export default function Challenges() {
  const [topTab, setTopTab] = useState<"challenges" | "rewards">("challenges");
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem("sp-challenges");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return initialChallenges;
  });
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");

  useEffect(() => {
    localStorage.setItem("sp-challenges", JSON.stringify(challenges));
  }, [challenges]);

  const [rewardCategory, setRewardCategory] = useState<"all" | "donate" | "personal" | "eco" | "voucher">("all");
  const [redeemedIds, setRedeemedIds] = useState<number[]>([]);
  const [showTerms, setShowTerms] = useState<Reward | null>(null);
  const [showVoucher, setShowVoucher] = useState<Reward | null>(null);
  const { points, addPoints, spendPoints } = usePoints();
  const { toast } = useToast();

  const refreshChallenges = useCallback(() => {
    setChallenges(initialChallenges);
    localStorage.removeItem("sp-challenges");
    toast({ title: "Challenges refreshed! 🔄", description: "All challenges have been reset." });
  }, [toast]);

  const toggleChallenge = (id: number) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newDone = !c.done;
          if (newDone) {
            addPoints(c.pts);
            toast({ title: `+${c.pts} points earned! 🎉`, description: `Completed: ${c.title}` });
          } else {
            spendPoints(c.pts);
          }
          return { ...c, done: newDone };
        }
        return c;
      })
    );
  };

  const handleRedeem = (reward: Reward) => {
    if (points < reward.cost) {
      toast({ title: "Not enough points", description: `You need ${reward.cost - points} more points.`, variant: "destructive" });
      return;
    }
    if (reward.category === "voucher" && reward.terms && !redeemedIds.includes(reward.id)) {
      setShowTerms(reward);
      return;
    }
    confirmRedeem(reward);
  };

  const confirmRedeem = (reward: Reward) => {
    spendPoints(reward.cost);
    setRedeemedIds((prev) => [...prev, reward.id]);
    setShowTerms(null);
    if (reward.category === "voucher") {
      setShowVoucher(reward);
    } else {
      toast({ title: "🎉 Reward Redeemed!", description: `You redeemed "${reward.title}" for ${reward.cost} pts.` });
    }
  };

  const filtered = challenges.filter((c) => c.category === activeTab);
  const completedCount = filtered.filter((c) => c.done).length;
  const totalPts = filtered.filter((c) => c.done).reduce((sum, c) => sum + c.pts, 0);
  const filteredRewards = rewardCategory === "all" ? rewardsList : rewardsList.filter((r) => r.category === rewardCategory);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Challenges & Rewards</h2>
        <p className="text-muted-foreground mt-1">Earn points and redeem for real impact</p>
      </div>

      {/* Points banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between animate-fade-up" style={{ animationDelay: "60ms" }}>
        <span className="text-sm text-foreground">Your Points</span>
        <span className="text-lg font-bold text-primary tabular-nums">{points.toLocaleString()} pts</span>
      </div>

      {/* Top toggle: Challenges / Rewards */}
      <div className="flex bg-muted rounded-xl p-1 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <button
          onClick={() => setTopTab("challenges")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
            topTab === "challenges"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Flame size={16} />
          Challenges
        </button>
        <button
          onClick={() => setTopTab("rewards")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
            topTab === "rewards"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Gift size={16} />
          Rewards
        </button>
      </div>

      {topTab === "challenges" ? (
        <>
          {/* Challenge category tabs */}
          <div className="flex gap-2 animate-fade-up" style={{ animationDelay: "120ms" }}>
            {challengeTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
                  activeTab === key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {completedCount}/{filtered.length} completed
              </span>
              <span className="text-sm font-semibold text-primary">+{totalPts} pts earned</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="bg-primary rounded-full h-2.5 transition-all duration-500"
                style={{ width: `${filtered.length ? (completedCount / filtered.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Challenge List */}
          <div className="space-y-3">
            {filtered.map((challenge, i) => (
              <button
                key={challenge.id}
                onClick={() => toggleChallenge(challenge.id)}
                className={`w-full text-left flex items-start gap-3 bg-card rounded-xl p-4 border transition-all duration-200 active:scale-[0.97] animate-fade-up ${
                  challenge.done ? "opacity-60" : "shadow-sm hover:shadow-md"
                }`}
                style={{ animationDelay: `${200 + i * 60}ms` }}
              >
                <span className="text-2xl mt-0.5">{challenge.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${challenge.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {challenge.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{challenge.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    +{challenge.pts}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      challenge.done ? "bg-success border-success" : "border-muted-foreground/30"
                    }`}
                  >
                    {challenge.done && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Reward category tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar animate-fade-up" style={{ animationDelay: "120ms" }}>
            {rewardCategories.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setRewardCategory(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] whitespace-nowrap ${
                  rewardCategory === key
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
            {filteredRewards.map((reward, i) => {
              const isRedeemed = redeemedIds.includes(reward.id);
              const canAfford = points >= reward.cost;

              return (
                <div
                  key={reward.id}
                  className={`bg-card border rounded-2xl p-4 transition-all duration-200 animate-fade-up ${
                    isRedeemed ? "opacity-50" : ""
                  }`}
                  style={{ animationDelay: `${160 + i * 60}ms` }}
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
                        {reward.category === "voucher" && reward.terms && (
                          <button
                            onClick={() => setShowTerms(reward)}
                            className="text-[10px] text-muted-foreground underline flex items-center gap-0.5"
                          >
                            <FileText size={10} /> T&C
                          </button>
                        )}
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
        </>
      )}

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Terms & Conditions
              </h3>
              <button onClick={() => setShowTerms(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 bg-muted rounded-xl p-3">
              <span className="text-2xl">{showTerms.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{showTerms.title}</p>
                <p className="text-xs text-primary font-medium tabular-nums">{showTerms.cost.toLocaleString()} pts</p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <ul className="space-y-2">
                {showTerms.terms?.split(". ").filter(Boolean).map((term, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {term.endsWith(".") ? term : `${term}.`}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTerms(null)}
                className="flex-1 bg-muted text-muted-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmRedeem(showTerms)}
                className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] shadow-lg shadow-primary/20"
              >
                Accept & Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Code Modal */}
      {showVoucher && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-5 space-y-4 animate-scale-in text-center">
            <span className="text-5xl">{showVoucher.emoji}</span>
            <h3 className="text-lg font-bold text-foreground">Voucher Redeemed! 🎉</h3>
            <p className="text-sm text-muted-foreground">{showVoucher.title}</p>
            <div className="bg-muted rounded-xl p-4 border-2 border-dashed border-primary/30">
              <p className="text-[10px] text-muted-foreground mb-1">Your voucher code</p>
              <p className="text-xl font-bold text-primary tracking-widest tabular-nums">{showVoucher.voucherCode}</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Screenshot this code. Show it at participating stores to redeem.</p>
            <button
              onClick={() => setShowVoucher(null)}
              className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
