import { useState } from "react";
import { Users, Minus, Plus, ChefHat, Scale, Utensils } from "lucide-react";

type HungerLevel = "light" | "moderate" | "hungry";

type Ingredient = {
  name: string;
  emoji: string;
  baseGrams: number; // per person at "moderate"
  unit: string;
};

const mealPresets: Record<string, Ingredient[]> = {
  "Pasta Bolognese": [
    { name: "Dried pasta", emoji: "🍝", baseGrams: 100, unit: "g" },
    { name: "Ground beef", emoji: "🥩", baseGrams: 120, unit: "g" },
    { name: "Tomato sauce", emoji: "🍅", baseGrams: 80, unit: "ml" },
    { name: "Onion", emoji: "🧅", baseGrams: 40, unit: "g" },
    { name: "Parmesan", emoji: "🧀", baseGrams: 15, unit: "g" },
  ],
  "Chicken Stir-fry": [
    { name: "Chicken breast", emoji: "🍗", baseGrams: 150, unit: "g" },
    { name: "Jasmine rice", emoji: "🍚", baseGrams: 90, unit: "g" },
    { name: "Mixed vegetables", emoji: "🥦", baseGrams: 100, unit: "g" },
    { name: "Soy sauce", emoji: "🫙", baseGrams: 15, unit: "ml" },
    { name: "Cooking oil", emoji: "🫒", baseGrams: 10, unit: "ml" },
  ],
  "Tacos": [
    { name: "Tortillas", emoji: "🌮", baseGrams: 2, unit: "pcs" },
    { name: "Ground meat", emoji: "🥩", baseGrams: 100, unit: "g" },
    { name: "Cheese", emoji: "🧀", baseGrams: 30, unit: "g" },
    { name: "Lettuce", emoji: "🥬", baseGrams: 25, unit: "g" },
    { name: "Sour cream", emoji: "🫙", baseGrams: 20, unit: "ml" },
    { name: "Tomato", emoji: "🍅", baseGrams: 40, unit: "g" },
  ],
  "Fried Rice": [
    { name: "Cooked rice", emoji: "🍚", baseGrams: 200, unit: "g" },
    { name: "Eggs", emoji: "🥚", baseGrams: 1, unit: "pcs" },
    { name: "Vegetables", emoji: "🥕", baseGrams: 80, unit: "g" },
    { name: "Soy sauce", emoji: "🫙", baseGrams: 12, unit: "ml" },
    { name: "Garlic", emoji: "🧄", baseGrams: 5, unit: "g" },
    { name: "Cooking oil", emoji: "🫒", baseGrams: 10, unit: "ml" },
  ],
};

const hungerMultiplier: Record<HungerLevel, { factor: number; label: string; emoji: string }> = {
  light: { factor: 0.75, label: "Light", emoji: "🍃" },
  moderate: { factor: 1, label: "Moderate", emoji: "😊" },
  hungry: { factor: 1.3, label: "Hungry", emoji: "🔥" },
};

export default function PortionCalc() {
  const [guests, setGuests] = useState(4);
  const [hunger, setHunger] = useState<HungerLevel>("moderate");
  const [selectedMeal, setSelectedMeal] = useState("Pasta Bolognese");

  const multiplier = hungerMultiplier[hunger].factor;
  const ingredients = mealPresets[selectedMeal];

  const calcAmount = (base: number) => {
    const amount = Math.round(base * guests * multiplier);
    return amount;
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Portion Calculator</h2>
        <p className="text-muted-foreground mt-1">Zero leftovers, zero waste</p>
      </div>

      {/* Guest counter */}
      <div className="bg-card border rounded-2xl p-5 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">Number of guests</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests(Math.max(1, guests - 1))}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center transition-all active:scale-[0.9]"
            >
              <Minus size={16} className="text-foreground" />
            </button>
            <span className="text-2xl font-bold text-foreground tabular-nums w-8 text-center">{guests}</span>
            <button
              onClick={() => setGuests(Math.min(20, guests + 1))}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all active:scale-[0.9]"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Hunger level */}
        <div>
          <span className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Scale size={16} className="text-primary" /> Hunger level
          </span>
          <div className="flex gap-2">
            {(Object.entries(hungerMultiplier) as [HungerLevel, typeof hungerMultiplier.light][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setHunger(key)}
                className={`flex-1 text-center py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.95] ${
                  hunger === key
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span className="block text-base mb-0.5">{val.emoji}</span>
                {val.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meal selector */}
      <div className="animate-fade-up" style={{ animationDelay: "160ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Utensils size={16} className="text-primary" /> Choose a meal
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(mealPresets).map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.95] ${
                selectedMeal === meal
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card border text-foreground"
              }`}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="bg-card border rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
          <ChefHat size={16} className="text-primary" /> {selectedMeal}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          For {guests} {guests === 1 ? "person" : "people"} · {hungerMultiplier[hunger].emoji} {hungerMultiplier[hunger].label} appetite
        </p>
        <div className="space-y-2.5">
          {ingredients.map((ing) => {
            const amount = calcAmount(ing.baseGrams);
            return (
              <div key={ing.name} className="flex items-center gap-3">
                <span className="text-lg">{ing.emoji}</span>
                <span className="flex-1 text-sm text-foreground">{ing.name}</span>
                <span className="text-sm font-bold text-foreground tabular-nums">
                  {amount} {ing.unit}
                </span>
              </div>
            );
          })}
        </div>

        {/* Zero waste badge */}
        <div className="mt-4 pt-3 border-t flex items-center justify-center gap-2">
          <span className="text-base">🎯</span>
          <p className="text-xs font-medium text-success">
            Calculated for zero leftovers
          </p>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-secondary rounded-2xl p-4 animate-fade-up" style={{ animationDelay: "320ms" }}>
        <p className="text-sm text-secondary-foreground leading-relaxed">
          💡 <strong>Tip:</strong> When cooking for guests, it's better to slightly undershoot than overshoot. You can always offer seconds from a separate batch!
        </p>
      </div>
    </div>
  );
}
