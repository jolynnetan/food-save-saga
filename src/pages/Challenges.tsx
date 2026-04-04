import { useState, useEffect, useCallback, useRef } from "react";
import { Flame, Calendar, Star, Gift, Check, Lock, Heart, TreePine, Sparkles, ShoppingBag, X, FileText, RefreshCw, Camera, Upload, MessageSquare, Cake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePoints } from "@/contexts/PointsContext";
import { addRedeemedItem } from "@/pages/Store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/contexts/SettingsContext";

type Challenge = {
  id: number;
  title: string;
  description: string;
  emoji: string;
  pts: number;
  done: boolean;
  category: "daily" | "weekly" | "monthly";
  proofType?: "photo" | "text";
  proofData?: string;
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

// Large pool of challenges for random selection
const challengePool: Omit<Challenge, "id" | "done">[] = [
  // Daily
  { title: "Finish yesterday's rice", description: "Don't let cooked rice go to waste", emoji: "🍚", pts: 10, category: "daily" },
  { title: "Plan meals for the week", description: "Create a meal plan to avoid over-buying", emoji: "📋", pts: 15, category: "daily" },
  { title: "Use wilting vegetables", description: "Cook with veggies before they go bad", emoji: "🥬", pts: 20, category: "daily" },
  { title: "Zero waste lunch", description: "Prepare a lunch with no food waste", emoji: "🥗", pts: 15, category: "daily" },
  { title: "Eat all leftovers", description: "Finish all leftover food in the fridge", emoji: "🍲", pts: 10, category: "daily" },
  { title: "No takeaway today", description: "Cook at home to reduce packaging waste", emoji: "🏠", pts: 15, category: "daily" },
  { title: "Use expiring items first", description: "Check dates and prioritize near-expiry food", emoji: "📅", pts: 10, category: "daily" },
  { title: "Share extra food", description: "Give surplus food to a neighbor or friend", emoji: "🤝", pts: 20, category: "daily" },
  { title: "Portion control meal", description: "Cook exact portions to avoid leftovers", emoji: "⚖️", pts: 10, category: "daily" },
  { title: "Freeze surplus food", description: "Freeze food that might go to waste", emoji: "🧊", pts: 15, category: "daily" },
  { title: "Fruit smoothie rescue", description: "Blend overripe fruits into a smoothie", emoji: "🍌", pts: 10, category: "daily" },
  { title: "Use stale bread", description: "Turn stale bread into croutons or breadcrumbs", emoji: "🍞", pts: 10, category: "daily" },
  // Weekly
  { title: "5 zero-waste days", description: "Go 5 consecutive days without wasting food", emoji: "🏆", pts: 100, category: "weekly" },
  { title: "Try 3 leftover recipes", description: "Cook 3 meals using only leftovers", emoji: "👨‍🍳", pts: 75, category: "weekly" },
  { title: "Reduce grocery bill 10%", description: "Spend less by buying only what you need", emoji: "💰", pts: 50, category: "weekly" },
  { title: "Meal prep Sunday", description: "Prep meals for the whole week ahead", emoji: "📦", pts: 60, category: "weekly" },
  { title: "Empty the fridge challenge", description: "Use everything in your fridge before shopping", emoji: "🧹", pts: 80, category: "weekly" },
  { title: "Teach someone food saving", description: "Share food-saving tips with a friend or family", emoji: "📚", pts: 50, category: "weekly" },
  { title: "Visit a local foodbank", description: "Donate items to a community foodbank", emoji: "🏪", pts: 90, category: "weekly" },
  { title: "No food waste for 3 days", description: "Track and ensure zero waste for 3 days", emoji: "✨", pts: 70, category: "weekly" },
  // Monthly
  { title: "30-day no waste streak", description: "An entire month without food waste", emoji: "🌟", pts: 500, category: "monthly" },
  { title: "Compost challenge", description: "Start composting your food scraps", emoji: "🌱", pts: 200, category: "monthly" },
  { title: "Organize a food drive", description: "Collect food donations from your community", emoji: "📢", pts: 400, category: "monthly" },
  { title: "Grow your own herbs", description: "Plant herbs at home to reduce food miles", emoji: "🌿", pts: 150, category: "monthly" },
  { title: "Zero-waste dinner party", description: "Host a dinner using rescued ingredients", emoji: "🎉", pts: 300, category: "monthly" },
  { title: "Track all food waste", description: "Log every piece of wasted food for a month", emoji: "📊", pts: 250, category: "monthly" },
];

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getRefreshTimestamps(): { daily: string; weekly: string; monthly: string } {
  try {
    const saved = localStorage.getItem("sp-challenge-timestamps");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { daily: "", weekly: "", monthly: "" };
}

function saveRefreshTimestamps(ts: { daily: string; weekly: string; monthly: string }) {
  localStorage.setItem("sp-challenge-timestamps", JSON.stringify(ts));
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // "2026-04-04"
}

function getWeekKey() {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
}

function getMonthKey() {
  return new Date().toISOString().slice(0, 7); // "2026-04"
}

function generateChallengesForCategory(category: "daily" | "weekly" | "monthly"): Omit<Challenge, "id" | "done">[] {
  const pool = challengePool.filter(c => c.category === category);
  const count = category === "daily" ? 4 : category === "weekly" ? 3 : 2;
  return pickRandom(pool, count);
}

function generateChallenges(): Challenge[] {
  const daily = generateChallengesForCategory("daily");
  const weekly = generateChallengesForCategory("weekly");
  const monthly = generateChallengesForCategory("monthly");
  const all = [...daily, ...weekly, ...monthly].map((c, i) => ({ ...c, id: Date.now() + i, done: false }));
  saveRefreshTimestamps({ daily: getTodayKey(), weekly: getWeekKey(), monthly: getMonthKey() });
  return all;
}

function autoRefreshChallenges(existing: Challenge[]): Challenge[] {
  const ts = getRefreshTimestamps();
  const needDaily = ts.daily !== getTodayKey();
  const needWeekly = ts.weekly !== getWeekKey();
  const needMonthly = ts.monthly !== getMonthKey();

  if (!needDaily && !needWeekly && !needMonthly) return existing;

  let updated = [...existing];

  if (needDaily) {
    const newDaily = generateChallengesForCategory("daily").map((c, i) => ({ ...c, id: Date.now() + i, done: false }));
    updated = updated.filter(c => c.category !== "daily").concat(newDaily);
  }
  if (needWeekly) {
    const newWeekly = generateChallengesForCategory("weekly").map((c, i) => ({ ...c, id: Date.now() + 100 + i, done: false }));
    updated = updated.filter(c => c.category !== "weekly").concat(newWeekly);
  }
  if (needMonthly) {
    const newMonthly = generateChallengesForCategory("monthly").map((c, i) => ({ ...c, id: Date.now() + 200 + i, done: false }));
    updated = updated.filter(c => c.category !== "monthly").concat(newMonthly);
  }

  saveRefreshTimestamps({
    daily: getTodayKey(),
    weekly: getWeekKey(),
    monthly: getMonthKey(),
  });

  return updated;
}

const rewardsList: Reward[] = [
  { id: 1, title: "Donate a Meal", emoji: "🍱", description: "A meal donated to a foodbank in your name", cost: 500, category: "donate" },
  { id: 2, title: "Plant a Tree", emoji: "🌳", description: "We plant a tree through our NGO partner", cost: 1000, category: "eco" },
  { id: 3, title: "Foodbank Restock", emoji: "🏪", description: "Donate supplies to a local foodbank", cost: 1500, category: "donate" },
  { id: 4, title: "Reusable Container Set", emoji: "♻️", description: "Eco-friendly food containers", cost: 2000, category: "eco" },
  { id: 5, title: "Premium Recipe Pack", emoji: "👨‍🍳", description: "20 exclusive zero-waste recipes", cost: 300, category: "personal" },
  { id: 6, title: "Feed a Family", emoji: "👨‍👩‍👧‍👦", description: "Sponsor a week of meals for a family", cost: 3000, category: "donate" },
  { id: 7, title: "Food Saver Badge", emoji: "🏅", description: "Exclusive profile badge", cost: 800, category: "personal" },
  { id: 11, title: "RM10 Grocery Voucher", emoji: "🛒", description: "RM10 off at participating stores", cost: 1500, category: "voucher", terms: "Valid for 30 days from redemption. Minimum purchase of RM50. Valid at participating stores only. Not combinable with other promotions. One voucher per transaction.", voucherCode: "FOOD-SAVE-10" },
  { id: 12, title: "RM5 Eco Market Voucher", emoji: "🥬", description: "RM5 off at eco-friendly markets", cost: 800, category: "voucher", terms: "Valid for 14 days from redemption. No minimum purchase required. Valid at participating eco markets only. Cannot be exchanged for cash.", voucherCode: "ECO-MKT-5" },
  { id: 13, title: "Free Delivery Voucher", emoji: "🚚", description: "Free delivery on grocery order", cost: 600, category: "voucher", terms: "Valid for 7 days from redemption. Minimum order of RM30. Delivery within city limits only. One use per account.", voucherCode: "FREE-DLVR" },
  { id: 14, title: "RM25 Meal Kit Voucher", emoji: "📦", description: "RM25 off a zero-waste meal kit", cost: 3500, category: "voucher", terms: "Valid for 60 days from redemption. First-time subscription only. Cannot be used with other discounts.", voucherCode: "MEALKIT-25" },
];

const birthdayVouchers: Reward[] = [
  { id: 901, title: "🎂 Birthday RM15 Voucher", emoji: "🎁", description: "Free RM15 grocery voucher — Happy Birthday!", cost: 0, category: "voucher", terms: "Valid for 30 days from redemption. Birthday month exclusive. One per year. Minimum purchase of RM30.", voucherCode: "BDAY-15" },
  { id: 902, title: "🎈 Birthday Eco Kit", emoji: "🎉", description: "Free eco container set for your birthday!", cost: 0, category: "eco", terms: "Valid during your birthday month only. One per year. Collect at participating stores." },
  { id: 903, title: "🎊 Birthday Meal Donation", emoji: "💝", description: "We donate a meal in your name — on us!", cost: 0, category: "donate", terms: "Automatically donated during your birthday month. One per year." },
];

// These will be populated inside the component with translations
const challengeTabKeys = [
  { key: "daily" as const, labelKey: "daily", icon: Flame },
  { key: "weekly" as const, labelKey: "weekly", icon: Calendar },
  { key: "monthly" as const, labelKey: "monthly", icon: Star },
];

const rewardCategoryKeys = [
  { key: "all" as const, labelKey: "all", icon: Sparkles },
  { key: "donate" as const, labelKey: "donate", icon: Heart },
  { key: "eco" as const, labelKey: "eco", icon: TreePine },
  { key: "voucher" as const, labelKey: "vouchers", icon: ShoppingBag },
];

export default function Challenges() {
  const [topTab, setTopTab] = useState<"challenges" | "rewards">("challenges");
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem("sp-challenges");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return autoRefreshChallenges(parsed);
      } catch { /* ignore */ }
    }
    return generateChallenges();
  });
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");

  // Birthday state
  const { user } = useAuth();
  const [isBirthdayMonth, setIsBirthdayMonth] = useState(false);
  const [birthdayRedeemed, setBirthdayRedeemed] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("sp-birthday-redeemed");
      if (saved) {
        const { year, ids } = JSON.parse(saved);
        if (year === new Date().getFullYear()) return ids;
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("birthday")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.birthday) {
          const bMonth = new Date(data.birthday + "T00:00:00").getMonth();
          setIsBirthdayMonth(bMonth === new Date().getMonth());
        }
      });
  }, [user]);

  // Proof submission state
  const [proofChallenge, setProofChallenge] = useState<Challenge | null>(null);
  const [proofType, setProofType] = useState<"photo" | "text">("photo");
  const [proofText, setProofText] = useState("");
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("sp-challenges", JSON.stringify(challenges));
  }, [challenges]);

  const [rewardCategory, setRewardCategory] = useState<"all" | "donate" | "personal" | "eco" | "voucher">("all");
  const [redeemedIds, setRedeemedIds] = useState<number[]>([]);
  const [showTerms, setShowTerms] = useState<Reward | null>(null);
  const [showVoucher, setShowVoucher] = useState<Reward | null>(null);
  const { points, addPoints, spendPoints } = usePoints();
  const { toast } = useToast();
  const t = useT();

  const refreshChallenges = useCallback(() => {
    const allDone = challenges.every(c => c.done);
    if (allDone) {
      // All done — replace everything
      const newChallenges = generateChallenges();
      setChallenges(newChallenges);
      localStorage.setItem("sp-challenges", JSON.stringify(newChallenges));
      toast({ title: "New challenges! 🎲", description: "All challenges completed! Here's a fresh set." });
    } else {
      // Only replace challenges with zero progress (not done)
      const hasUndone = challenges.some(c => !c.done);
      if (!hasUndone) return;
      const newPool = generateChallenges();
      let poolIndex = 0;
      const updated = challenges.map(c => {
        if (!c.done) {
          // Find a replacement from the pool with matching category
          const replacement = newPool.find((n, idx) => idx >= poolIndex && n.category === c.category);
          if (replacement) {
            poolIndex = newPool.indexOf(replacement) + 1;
            return { ...replacement, id: Date.now() + Math.random() };
          }
          // Fallback: pick any from pool
          const fallback = newPool[poolIndex++] || c;
          return { ...fallback, id: Date.now() + Math.random(), category: c.category };
        }
        return c;
      });
      setChallenges(updated);
      localStorage.setItem("sp-challenges", JSON.stringify(updated));
      toast({ title: "Challenges refreshed 🎲", description: "Incomplete challenges have been replaced with new ones." });
    }
  }, [challenges, toast]);

  const handleChallengeClick = (challenge: Challenge) => {
    if (challenge.done) {
      // Toggle off - undo
      setChallenges(prev =>
        prev.map(c => {
          if (c.id === challenge.id) {
            spendPoints(c.pts);
            return { ...c, done: false, proofType: undefined, proofData: undefined };
          }
          return c;
        })
      );
      return;
    }
    // Open proof modal
    setProofChallenge(challenge);
    setProofType("photo");
    setProofText("");
    setProofPhoto(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProofPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitProof = () => {
    if (!proofChallenge) return;
    const proofData = proofType === "photo" ? proofPhoto : proofText;
    if (!proofData || (proofType === "text" && proofText.trim().length < 5)) {
      toast({ title: "Proof required", description: proofType === "photo" ? "Please upload a photo as proof." : "Please write at least a few words describing how you completed this.", variant: "destructive" });
      return;
    }

    setChallenges(prev =>
      prev.map(c => {
        if (c.id === proofChallenge.id) {
          addPoints(c.pts);
          toast({ title: `+${c.pts} points earned! 🎉`, description: `Completed: ${c.title}` });
          return { ...c, done: true, proofType, proofData: proofData };
        }
        return c;
      })
    );
    setProofChallenge(null);
  };

  const handleRedeem = (reward: Reward) => {
    // Birthday vouchers are free
    if (birthdayVouchers.some(b => b.id === reward.id)) {
      if (birthdayRedeemed.includes(reward.id)) return;
      if (reward.terms) {
        setShowTerms(reward);
        return;
      }
      confirmBirthdayRedeem(reward);
      return;
    }
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

  const confirmBirthdayRedeem = (reward: Reward) => {
    const newRedeemed = [...birthdayRedeemed, reward.id];
    setBirthdayRedeemed(newRedeemed);
    localStorage.setItem("sp-birthday-redeemed", JSON.stringify({ year: new Date().getFullYear(), ids: newRedeemed }));
    setShowTerms(null);
    addRedeemedItem({
      id: reward.id,
      title: reward.title,
      emoji: reward.emoji,
      description: reward.description,
      cost: 0,
      category: reward.category,
      voucherCode: reward.voucherCode,
      terms: reward.terms,
    });
    if (reward.voucherCode) {
      setShowVoucher(reward);
    } else {
      toast({ title: "🎂 Birthday Reward Claimed!", description: `You claimed "${reward.title}". Happy Birthday!` });
    }
  };

  const confirmRedeem = (reward: Reward) => {
    spendPoints(reward.cost);
    setRedeemedIds((prev) => [...prev, reward.id]);
    setShowTerms(null);
    addRedeemedItem({
      id: reward.id,
      title: reward.title,
      emoji: reward.emoji,
      description: reward.description,
      cost: reward.cost,
      category: reward.category,
      voucherCode: reward.voucherCode,
      terms: reward.terms,
    });
    if (reward.category === "voucher") {
      setShowVoucher(reward);
    } else {
      toast({ title: "🎉 Reward Redeemed!", description: `You redeemed "${reward.title}". Check your Store in More!` });
    }
  };

  const filtered = challenges.filter((c) => c.category === activeTab);
  const completedCount = filtered.filter((c) => c.done).length;
  const totalPts = filtered.filter((c) => c.done).reduce((sum, c) => sum + c.pts, 0);
  const filteredRewards = rewardCategory === "all" ? rewardsList : rewardsList.filter((r) => r.category === rewardCategory);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">{t("challengesAndRewards")}</h2>
        <p className="text-muted-foreground mt-1">{t("earnPointsDesc")}</p>
      </div>

      {/* Points banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between animate-fade-up" style={{ animationDelay: "60ms" }}>
        <span className="text-sm text-foreground">{t("yourPoints")}</span>
        <span className="text-lg font-bold text-primary tabular-nums">{points.toLocaleString()} {t("pts")}</span>
      </div>

      {/* Top toggle */}
      <div className="flex bg-muted rounded-xl p-1 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <button
          onClick={() => setTopTab("challenges")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
            topTab === "challenges" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          <Flame size={16} /> {t("challenges")}
        </button>
        <button
          onClick={() => setTopTab("rewards")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
            topTab === "rewards" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          <Gift size={16} /> {t("rewards")}
        </button>
      </div>

      {topTab === "challenges" ? (
        <>
          {/* Category tabs */}
          <div className="flex items-center gap-2 animate-fade-up" style={{ animationDelay: "120ms" }}>
            {challengeTabKeys.map(({ key, labelKey, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
                  activeTab === key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon size={14} /> {t(labelKey)}
              </button>
            ))}
            <button
              onClick={refreshChallenges}
              className="ml-auto flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-200 active:scale-[0.96]"
              title="Get new challenges"
            >
              <RefreshCw size={13} /> {t("newChallenges")}
            </button>
          </div>

          {/* Progress */}
          <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{completedCount}/{filtered.length} {t("completed")}</span>
              <span className="text-sm font-semibold text-primary">+{totalPts} {t("ptsEarned")}</span>
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
                onClick={() => handleChallengeClick(challenge)}
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
                  {challenge.done && challenge.proofType && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-success">
                      {challenge.proofType === "photo" ? <Camera size={10} /> : <MessageSquare size={10} />}
                      Proof submitted
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">+{challenge.pts}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    challenge.done ? "bg-success border-success" : "border-muted-foreground/30"
                  }`}>
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
            {rewardCategoryKeys.map(({ key, labelKey, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setRewardCategory(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] whitespace-nowrap ${
                  rewardCategory === key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon size={14} /> {t(labelKey)}
              </button>
            ))}
          </div>

          {/* Birthday Vouchers */}
          {isBirthdayMonth && (
            <div className="space-y-3 animate-fade-up" style={{ animationDelay: "140ms" }}>
              <div className="bg-gradient-to-r from-primary/10 via-warning/10 to-primary/10 border border-primary/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Cake size={18} className="text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{t("happyBirthday")}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{t("birthdayDesc")}</p>
                <div className="space-y-2">
                  {birthdayVouchers.map((reward) => {
                    const isClaimed = birthdayRedeemed.includes(reward.id);
                    return (
                      <div key={reward.id} className={`bg-card rounded-xl p-3 flex items-center gap-3 ${isClaimed ? "opacity-50" : ""}`}>
                        <span className="text-2xl">{reward.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{reward.title}</p>
                          <p className="text-[10px] text-muted-foreground">{reward.description}</p>
                        </div>
                        <button
                          onClick={() => handleRedeem(reward)}
                          disabled={isClaimed}
                          className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-[0.95] ${
                            isClaimed
                              ? "bg-success/10 text-success"
                              : "bg-primary text-primary-foreground shadow-sm"
                          }`}
                        >
                          {isClaimed ? <><Check size={12} /> {t("claimed")}</> : <><Gift size={12} /> {t("free")}</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Rewards list */}
          <div className="space-y-3">
            {filteredRewards.map((reward, i) => {
              const isRedeemed = redeemedIds.includes(reward.id);
              const canAfford = points >= reward.cost;
              return (
                <div
                  key={reward.id}
                  className={`bg-card border rounded-2xl p-4 transition-all duration-200 animate-fade-up ${isRedeemed ? "opacity-50" : ""}`}
                  style={{ animationDelay: `${160 + i * 60}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl mt-0.5">{reward.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{reward.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{reward.description}</p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full tabular-nums">{reward.cost.toLocaleString()} pts</span>
                        {reward.category === "voucher" && reward.terms && (
                          <button onClick={() => setShowTerms(reward)} className="text-[10px] text-muted-foreground underline flex items-center gap-0.5">
                            <FileText size={10} /> T&C
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={isRedeemed || !canAfford}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.95] ${
                        isRedeemed ? "bg-success/10 text-success cursor-default"
                          : canAfford ? "bg-primary text-primary-foreground shadow-sm hover:shadow-md"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      {isRedeemed ? <><Check size={14} /> {t("done")}</> : canAfford ? <><Gift size={14} /> {t("redeem")}</> : <><Lock size={14} /> {t("locked")}</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Proof Submission Dialog */}
      <Dialog open={!!proofChallenge} onOpenChange={(open) => !open && setProofChallenge(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <span className="text-xl">{proofChallenge?.emoji}</span> {t("completeChallenge")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t("submitProof")}: <span className="font-medium text-foreground">{proofChallenge?.title}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Proof type toggle */}
          <div className="flex bg-muted rounded-lg p-1 gap-1">
            <button
              onClick={() => setProofType("photo")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                proofType === "photo" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <Camera size={14} /> Upload Photo
            </button>
            <button
              onClick={() => setProofType("text")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
                proofType === "text" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              <MessageSquare size={14} /> Description
            </button>
          </div>

          {proofType === "photo" ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              {proofPhoto ? (
                <div className="relative">
                  <img src={proofPhoto} alt="Proof" className="w-full h-40 object-cover rounded-xl border" />
                  <button
                    onClick={() => { setProofPhoto(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <Upload size={24} />
                  <span className="text-xs font-medium">Tap to upload photo</span>
                </button>
              )}
            </div>
          ) : (
            <Textarea
              placeholder="Describe how you completed this challenge..."
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              rows={4}
              className="text-sm resize-none"
            />
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setProofChallenge(null)}
              className="flex-1 bg-muted text-muted-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97]"
            >
              Cancel
            </button>
            <button
              onClick={submitProof}
              className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] shadow-lg shadow-primary/20"
            >
              Submit & Earn +{proofChallenge?.pts} pts
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-md p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FileText size={18} className="text-primary" /> Terms & Conditions
              </h3>
              <button onClick={() => setShowTerms(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="flex items-center gap-3 bg-muted rounded-xl p-3">
              <span className="text-2xl">{showTerms.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{showTerms.title}</p>
                <p className="text-xs text-primary font-medium tabular-nums">{showTerms.cost === 0 ? "FREE 🎂" : `${showTerms.cost.toLocaleString()} pts`}</p>
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
              <button onClick={() => setShowTerms(null)} className="flex-1 bg-muted text-muted-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]">Cancel</button>
              {birthdayVouchers.some(b => b.id === showTerms.id) ? (
                <button onClick={() => confirmBirthdayRedeem(showTerms)} className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] shadow-lg shadow-primary/20">Accept & Claim Free</button>
              ) : points >= showTerms.cost ? (
                <button onClick={() => confirmRedeem(showTerms)} className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] shadow-lg shadow-primary/20">Accept & Redeem</button>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-muted/80 rounded-xl py-2.5 gap-0.5">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Lock size={12} /> Insufficient Points</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">Need {(showTerms.cost - points).toLocaleString()} more pts</span>
                </div>
              )}
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
            <button onClick={() => setShowVoucher(null)} className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97]">Got it!</button>
          </div>
        </div>
      )}
    </div>
  );
}
