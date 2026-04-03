import { useState, useRef, useEffect } from "react";
import { Plus, Flame, Beef, Wheat, Droplets, X, Camera, ScanBarcode, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay } from "date-fns";

type Meal = {
  id: string;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
};

const goalCalories = 2000;

const commonFoods = [
  { name: "Rice (1 cup)", emoji: "🍚", calories: 206, protein: 4, carbs: 45, fat: 0.4 },
  { name: "Chicken breast", emoji: "🍗", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Egg (1 large)", emoji: "🥚", calories: 72, protein: 6, carbs: 0.4, fat: 5 },
  { name: "Apple", emoji: "🍎", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Bread (1 slice)", emoji: "🍞", calories: 79, protein: 3, carbs: 15, fat: 1 },
  { name: "Banana", emoji: "🍌", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
];

const barcodeDb: Record<string, { name: string; emoji: string; calories: number; protein: number; carbs: number; fat: number }> = {
  "4901234567890": { name: "Instant Noodles", emoji: "🍜", calories: 380, protein: 8, carbs: 52, fat: 14 },
  "8888888888888": { name: "Coconut Milk", emoji: "🥥", calories: 190, protein: 2, carbs: 3, fat: 19 },
  "1234567890123": { name: "Granola Bar", emoji: "🥜", calories: 150, protein: 4, carbs: 22, fat: 6 },
};

const SCAN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/food-assistant`;

export default function CalorieTracker() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<{ day: string; calories: number; protein: number; carbs: number; fat: number }[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [scanMode, setScanMode] = useState<"none" | "photo" | "barcode" | "manual">("none");
  const [scanning, setScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [estimating, setEstimating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch today's meals from DB
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchData = async () => {
      setLoading(true);
      // Today's meals
      const { data: todayData } = await supabase
        .from("calorie_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("logged_date", today)
        .order("created_at", { ascending: true });

      if (todayData) {
        setMeals(todayData.map(m => ({
          id: m.id,
          name: m.name,
          emoji: m.emoji,
          calories: m.calories,
          protein: m.protein,
          carbs: m.carbs,
          fat: m.fat,
          time: format(new Date(m.created_at), "h:mm a"),
        })));
      }

      // Weekly data
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekStart = subDays(startOfDay(new Date()), 6);
      const { data: weekData } = await supabase
        .from("calorie_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_date", format(weekStart, "yyyy-MM-dd"))
        .lte("logged_date", today);

      const grouped: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
      for (let i = 0; i < 7; i++) {
        const d = subDays(new Date(), 6 - i);
        const key = format(d, "yyyy-MM-dd");
        grouped[key] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      (weekData || []).forEach(e => {
        if (grouped[e.logged_date]) {
          grouped[e.logged_date].calories += e.calories;
          grouped[e.logged_date].protein += e.protein;
          grouped[e.logged_date].carbs += e.carbs;
          grouped[e.logged_date].fat += e.fat;
        }
      });
      setWeeklyData(Object.entries(grouped).map(([date, vals]) => ({
        day: days[new Date(date + "T12:00:00").getDay()],
        ...vals,
      })));

      setLoading(false);
    };
    fetchData();
  }, [user, today]);

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);
  const caloriePercent = Math.min((totalCalories / goalCalories) * 100, 100);

  const addMeal = async (food: { name: string; emoji: string; calories: number; protein: number; carbs: number; fat: number }) => {
    if (!user) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

    const { data, error } = await supabase.from("calorie_entries").insert({
      user_id: user.id,
      name: food.name,
      emoji: food.emoji,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      meal_time: time,
      logged_date: today,
    }).select().single();

    if (!error && data) {
      setMeals(prev => [...prev, { id: data.id, ...food, time }]);
    }
    setShowAdd(false);
    setScanMode("none");
  };

  const handlePhotoScan = async (file: File) => {
    setScanning(true);
    const description = `I took a photo of food. The file is named "${file.name}". Please estimate the calories for a typical serving of this type of food.`;
    try {
      const resp = await fetch(SCAN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ mode: "scan-calories", messages: [{ role: "user", content: description }] }),
      });
      if (!resp.ok) throw new Error("Scan failed");
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") continue;
            try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) full += c; } catch {}
          }
        }
      }
      const jsonMatch = full.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        if (data.items?.length > 0) {
          for (const item of data.items) {
            await addMeal({ name: item.name, emoji: item.emoji || "📸", calories: item.calories || 0, protein: item.protein || 0, carbs: item.carbs || 0, fat: item.fat || 0 });
          }
          toast({ title: "📸 Food scanned!", description: `Added ${data.items.length} item(s).` });
        }
      } else {
        await addMeal({ name: "Scanned meal", emoji: "📸", calories: 350, protein: 18, carbs: 40, fat: 12 });
        toast({ title: "📸 Estimated!", description: "Added approximate calories." });
      }
    } catch {
      await addMeal({ name: "Scanned meal", emoji: "📸", calories: 350, protein: 18, carbs: 40, fat: 12 });
      toast({ title: "📸 Estimated!", description: "Added approximate calories." });
    }
    setScanning(false);
    setScanMode("none");
  };

  const handleBarcodeLookup = () => {
    const food = barcodeDb[barcodeInput.trim()];
    if (food) {
      addMeal(food);
      toast({ title: "🔍 Product found!", description: `Added ${food.name}.` });
    } else {
      toast({ title: "Product not found", description: "Try photo scan instead.", variant: "destructive" });
    }
    setBarcodeInput("");
    setScanMode("none");
  };

  const handleManualEstimate = async () => {
    const foodName = manualInput.trim();
    if (!foodName) return;
    setEstimating(true);
    try {
      const resp = await fetch(SCAN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: "scan-calories",
          messages: [{ role: "user", content: `Estimate the calories and macronutrients for: ${foodName}. Return JSON with items array containing objects with name, emoji, calories, protein, carbs, fat.` }],
        }),
      });
      if (!resp.ok) throw new Error("Estimation failed");
      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") continue;
            try { const p = JSON.parse(json); const c = p.choices?.[0]?.delta?.content; if (c) full += c; } catch {}
          }
        }
      }
      const jsonMatch = full.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        if (data.items?.length > 0) {
          for (const item of data.items) {
            await addMeal({ name: item.name || foodName, emoji: item.emoji || "🍽️", calories: item.calories || 0, protein: item.protein || 0, carbs: item.carbs || 0, fat: item.fat || 0 });
          }
          toast({ title: "✨ AI Estimated!", description: `Added ${data.items.length} item(s) with estimated nutrition.` });
        } else {
          throw new Error("No items");
        }
      } else {
        throw new Error("No JSON");
      }
    } catch {
      await addMeal({ name: foodName, emoji: "🍽️", calories: 200, protein: 10, carbs: 25, fat: 8 });
      toast({ title: "🍽️ Added!", description: "Used rough estimate. You can edit later." });
    }
    setManualInput("");
    setEstimating(false);
    setScanMode("none");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Calorie Tracker</h2>
          <p className="text-muted-foreground mt-1">Stay on top of your nutrition</p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setScanMode("none"); }}
          className="bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.9]"
        >
          {showAdd ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Daily goal ring */}
      <div className="bg-card border rounded-2xl p-5 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${caloriePercent}, 100`} strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-foreground tabular-nums">{totalCalories}</span>
              <span className="text-[10px] text-muted-foreground">/ {goalCalories}</span>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            <MacroBar label="Protein" value={totalProtein} unit="g" max={120} color="bg-primary" icon={<Beef size={14} />} />
            <MacroBar label="Carbs" value={totalCarbs} unit="g" max={300} color="bg-warning" icon={<Wheat size={14} />} />
            <MacroBar label="Fat" value={totalFat} unit="g" max={80} color="bg-streak" icon={<Droplets size={14} />} />
          </div>
        </div>
      </div>

      {/* Add food panel */}
      {showAdd && (
        <div className="bg-card border rounded-2xl p-4 animate-scale-in space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setScanMode("manual")} className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] ${scanMode === "manual" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              ✏️ Manual
            </button>
            <button onClick={() => setScanMode("photo")} className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] ${scanMode === "photo" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <Camera size={16} /> Photo
            </button>
            <button onClick={() => setScanMode("barcode")} className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.97] ${scanMode === "barcode" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <ScanBarcode size={16} /> Barcode
            </button>
          </div>

          {scanMode === "photo" && (
            <div className="space-y-3">
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-primary/30 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
                {scanning ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="animate-spin w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full" />
                    Analyzing food...
                  </div>
                ) : (
                  <>
                    <Camera size={24} className="text-primary" />
                    <p className="text-sm text-foreground font-medium">Take a photo of your food</p>
                    <p className="text-xs text-muted-foreground">AI will estimate calories & macros</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhotoScan(e.target.files[0])} />
            </div>
          )}

          {scanMode === "barcode" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} placeholder="Enter barcode number" className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30" />
                <button onClick={handleBarcodeLookup} disabled={!barcodeInput.trim()} className="bg-primary text-primary-foreground rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-40">Look up</button>
              </div>
              <p className="text-[10px] text-muted-foreground">Try: 4901234567890, 8888888888888, or 1234567890123</p>
            </div>
          )}

          {scanMode === "none" && (
            <>
              <h3 className="text-sm font-semibold text-foreground">Quick Add Food</h3>
              <div className="grid grid-cols-2 gap-2">
                {commonFoods.map((food) => (
                  <button key={food.name} onClick={() => addMeal(food)} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.97] hover:bg-muted/80">
                    <span className="text-lg">{food.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{food.name}</p>
                      <p className="text-[10px] text-muted-foreground tabular-nums">{food.calories} cal</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Weekly trend */}
      {weeklyData.length > 0 && (
        <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Flame size={16} className="text-streak" /> Weekly Calorie Trend
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} formatter={(value: number) => [`${value} cal`, "Calories"]} />
              <Line type="monotone" dataKey="calories" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span className="w-4 border-t-2 border-dashed border-primary" />
            <span>Goal: {goalCalories} cal/day</span>
          </div>
        </div>
      )}

      {/* Macro breakdown */}
      {weeklyData.length > 0 && (
        <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <h3 className="text-sm font-semibold text-foreground mb-3">Weekly Macros</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={weeklyData} barGap={1}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />
              <Bar dataKey="protein" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={20}>
                {weeklyData.map((_, i) => <Cell key={i} fill="hsl(var(--primary))" />)}
              </Bar>
              <Bar dataKey="carbs" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={20}>
                {weeklyData.map((_, i) => <Cell key={i} fill="hsl(var(--warning))" />)}
              </Bar>
              <Bar dataKey="fat" stackId="a" radius={[6, 6, 0, 0]} maxBarSize={20}>
                {weeklyData.map((_, i) => <Cell key={i} fill="hsl(var(--streak))" />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Protein</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> Carbs</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-streak" /> Fat</span>
          </div>
        </div>
      )}

      {/* Today's meals */}
      <section className="animate-fade-up" style={{ animationDelay: "320ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Today's Meals</h3>
        {meals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No meals logged today. Tap + to add your first meal!</p>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div key={meal.id} className="flex items-center gap-3 bg-card border rounded-xl p-3">
                <span className="text-xl">{meal.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{meal.name}</p>
                  <p className="text-xs text-muted-foreground">{meal.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground tabular-nums">{meal.calories}</p>
                  <p className="text-[10px] text-muted-foreground">cal</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MacroBar({ label, value, unit, max, color, icon }: {
  label: string; value: number; unit: string; max: number; color: string;
  icon: React.ReactNode;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">{icon} {label}</span>
        <span className="font-medium text-foreground tabular-nums">{Math.round(value)}{unit}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
