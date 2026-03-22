import { useState } from "react";
import { Plus, Flame, Beef, Wheat, Droplets, X } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
  LineChart, Line, CartesianGrid,
} from "recharts";

type Meal = {
  id: number;
  name: string;
  emoji: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
};

const todayMeals: Meal[] = [
  { id: 1, name: "Oatmeal with berries", emoji: "🥣", calories: 320, protein: 12, carbs: 48, fat: 8, time: "8:00 AM" },
  { id: 2, name: "Grilled chicken salad", emoji: "🥗", calories: 480, protein: 38, carbs: 18, fat: 22, time: "12:30 PM" },
  { id: 3, name: "Greek yogurt", emoji: "🥛", calories: 150, protein: 14, carbs: 12, fat: 4, time: "3:00 PM" },
  { id: 4, name: "Salmon with rice", emoji: "🍣", calories: 620, protein: 42, carbs: 55, fat: 18, time: "7:00 PM" },
];

const weeklyData = [
  { day: "Mon", calories: 1850, protein: 95, carbs: 210, fat: 62 },
  { day: "Tue", calories: 2100, protein: 110, carbs: 240, fat: 70 },
  { day: "Wed", calories: 1720, protein: 88, carbs: 195, fat: 58 },
  { day: "Thu", calories: 1950, protein: 102, carbs: 220, fat: 65 },
  { day: "Fri", calories: 2200, protein: 115, carbs: 250, fat: 73 },
  { day: "Sat", calories: 1680, protein: 82, carbs: 188, fat: 56 },
  { day: "Sun", calories: 1570, protein: 78, carbs: 175, fat: 52 },
];

const goalCalories = 2000;

const commonFoods = [
  { name: "Rice (1 cup)", emoji: "🍚", calories: 206, protein: 4, carbs: 45, fat: 0.4 },
  { name: "Chicken breast", emoji: "🍗", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Egg (1 large)", emoji: "🥚", calories: 72, protein: 6, carbs: 0.4, fat: 5 },
  { name: "Apple", emoji: "🍎", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Bread (1 slice)", emoji: "🍞", calories: 79, protein: 3, carbs: 15, fat: 1 },
  { name: "Banana", emoji: "🍌", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
];

export default function CalorieTracker() {
  const [meals, setMeals] = useState(todayMeals);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedFood, setSelectedFood] = useState<typeof commonFoods[0] | null>(null);

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);
  const caloriePercent = Math.min((totalCalories / goalCalories) * 100, 100);

  const addMeal = (food: typeof commonFoods[0]) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setMeals([...meals, {
      id: Date.now(),
      name: food.name,
      emoji: food.emoji,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      time,
    }]);
    setShowAdd(false);
    setSelectedFood(null);
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Calorie Tracker</h2>
          <p className="text-muted-foreground mt-1">Stay on top of your nutrition</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
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
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeDasharray={`${caloriePercent}, 100`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
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

      {/* Quick add */}
      {showAdd && (
        <div className="bg-card border rounded-2xl p-4 animate-scale-in space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Add Food</h3>
          <div className="grid grid-cols-2 gap-2">
            {commonFoods.map((food) => (
              <button
                key={food.name}
                onClick={() => addMeal(food)}
                className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.97] hover:bg-muted/80"
              >
                <span className="text-lg">{food.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{food.name}</p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">{food.calories} cal</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekly trend */}
      <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Flame size={16} className="text-streak" /> Weekly Calorie Trend
        </h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
              formatter={(value: number) => [`${value} cal`, "Calories"]}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "hsl(var(--primary))" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* Goal line label */}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span className="w-4 border-t-2 border-dashed border-primary" />
          <span>Goal: {goalCalories} cal/day</span>
        </div>
      </div>

      {/* Macro breakdown weekly */}
      <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Weekly Macros</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={weeklyData} barGap={1}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
            />
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

      {/* Today's meals */}
      <section className="animate-fade-up" style={{ animationDelay: "320ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3">Today's Meals</h3>
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
        <span className="font-semibold text-foreground tabular-nums">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
