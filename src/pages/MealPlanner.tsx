import { useState, useEffect } from "react";
import { CalendarDays, Plus, Trash2, ShoppingCart, Sparkles, ChevronDown, ChevronUp, ChefHat, AlertTriangle, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";


type Ingredient = { name: string; amount: string; cal: number };
type PlannedMeal = {
  id: string;
  name: string;
  emoji: string;
  slot: "breakfast" | "lunch" | "dinner";
  day: number;
  ingredients: Ingredient[];
  calories: number;
  isFromRecipe: boolean;
};

type PantryItem = { name: string; quantity: string };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS = ["breakfast", "lunch", "dinner"] as const;
const SLOT_LABELS: Record<string, { label: string; emoji: string }> = {
  breakfast: { label: "Breakfast", emoji: "🌅" },
  lunch: { label: "Lunch", emoji: "☀️" },
  dinner: { label: "Dinner", emoji: "🌙" },
};

function getRecipesFromStorage(): any[] {
  try {
    const saved = localStorage.getItem("sp-user-recipes");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

const builtInRecipes = [
  { name: "Thai Basil Stir-Fry", emoji: "🍜", calories: 380, ingredients: [{ name: "Chicken breast", amount: "300g", cal: 165 }, { name: "Thai basil", amount: "1 cup", cal: 5 }, { name: "Jasmine rice", amount: "200g", cal: 260 }] },
  { name: "Mediterranean Quinoa Bowl", emoji: "🥗", calories: 420, ingredients: [{ name: "Quinoa", amount: "150g", cal: 180 }, { name: "Cherry tomatoes", amount: "200g", cal: 36 }, { name: "Feta cheese", amount: "60g", cal: 160 }] },
  { name: "Chickpea Tikka Masala", emoji: "🍛", calories: 340, ingredients: [{ name: "Chickpeas", amount: "400g", cal: 210 }, { name: "Coconut milk", amount: "200ml", cal: 190 }, { name: "Basmati rice", amount: "200g", cal: 260 }] },
  { name: "Grilled Salmon & Greens", emoji: "🐟", calories: 450, ingredients: [{ name: "Salmon fillets", amount: "300g", cal: 400 }, { name: "Mixed greens", amount: "150g", cal: 20 }, { name: "Avocado", amount: "1 medium", cal: 240 }] },
  { name: "Black Bean Tacos", emoji: "🌮", calories: 320, ingredients: [{ name: "Corn tortillas", amount: "6 pcs", cal: 180 }, { name: "Black beans", amount: "300g", cal: 210 }, { name: "Avocado", amount: "1 medium", cal: 240 }] },
  { name: "Tofu Poke Bowl", emoji: "🍣", calories: 390, ingredients: [{ name: "Firm tofu", amount: "300g", cal: 210 }, { name: "Sushi rice", amount: "200g", cal: 260 }, { name: "Edamame", amount: "100g", cal: 120 }] },
  { name: "Oatmeal Bowl", emoji: "🥣", calories: 280, ingredients: [{ name: "Rolled oats", amount: "80g", cal: 200 }, { name: "Banana", amount: "1 pc", cal: 105 }, { name: "Honey", amount: "1 tbsp", cal: 64 }] },
  { name: "Scrambled Eggs & Toast", emoji: "🍳", calories: 350, ingredients: [{ name: "Eggs", amount: "3 pcs", cal: 216 }, { name: "Bread", amount: "2 slices", cal: 140 }, { name: "Butter", amount: "1 tbsp", cal: 100 }] },
  { name: "Fruit Smoothie", emoji: "🥤", calories: 220, ingredients: [{ name: "Banana", amount: "1 pc", cal: 105 }, { name: "Berries", amount: "100g", cal: 50 }, { name: "Yogurt", amount: "150ml", cal: 90 }] },
];

function getPantryItems(): PantryItem[] {
  // Simulate pantry data
  return [
    { name: "Eggs", quantity: "6 pcs" },
    { name: "Chicken breast", quantity: "400g" },
    { name: "Jasmine rice", quantity: "1 kg" },
    { name: "Milk", quantity: "1L" },
    { name: "Bread", quantity: "1 loaf" },
    { name: "Banana", quantity: "5 pcs" },
    { name: "Rolled oats", quantity: "500g" },
  ];
}

function checkIngredientAvailability(ingredientName: string, pantry: PantryItem[]): boolean {
  return pantry.some(p => p.name.toLowerCase().includes(ingredientName.toLowerCase()) || ingredientName.toLowerCase().includes(p.name.toLowerCase()));
}

export default function MealPlanner() {
  const [meals, setMeals] = useState<PlannedMeal[]>(() => {
    try {
      const s = localStorage.getItem("sp-meal-plan");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [expandedDay, setExpandedDay] = useState<number>(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [showRecipePicker, setShowRecipePicker] = useState<{ day: number; slot: string } | null>(null);
  const [showManualAdd, setShowManualAdd] = useState<{ day: number; slot: string } | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualCalories, setManualCalories] = useState("");
  const [suggesting, setSuggesting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragItem, setDragItem] = useState<PlannedMeal | null>(null);

  const pantry = getPantryItems();

  useEffect(() => {
    localStorage.setItem("sp-meal-plan", JSON.stringify(meals));
  }, [meals]);

  const allRecipes = [...builtInRecipes, ...getRecipesFromStorage().map((r: any) => ({
    name: r.name, emoji: r.emoji || "🍽️", calories: r.calories || 300,
    ingredients: r.ingredients || [],
  }))];

  const addMealFromRecipe = (recipe: any, day: number, slot: string) => {
    const meal: PlannedMeal = {
      id: `${Date.now()}-${Math.random()}`,
      name: recipe.name,
      emoji: recipe.emoji,
      slot: slot as any,
      day,
      ingredients: recipe.ingredients || [],
      calories: recipe.calories,
      isFromRecipe: true,
    };
    setMeals(prev => [...prev.filter(m => !(m.day === day && m.slot === slot)), meal]);
    setShowRecipePicker(null);
    toast.success(`${recipe.emoji} ${recipe.name} added to ${DAYS[day]} ${slot}`);
  };

  const saveManualMeal = (day: number, slot: string) => {
    if (!manualName.trim()) return;
    const meal: PlannedMeal = {
      id: `${Date.now()}-${Math.random()}`,
      name: manualName.trim(),
      emoji: "🍽️",
      slot: slot as any,
      day,
      ingredients: [],
      calories: 0,
      isFromRecipe: false,
    };
    setMeals(prev => [...prev.filter(m => !(m.day === day && m.slot === slot)), meal]);
    setManualName("");
    setManualCalories("");
    setShowManualAdd(null);
    toast.success(`🍽️ ${meal.name} saved to ${DAYS[day]} ${SLOT_LABELS[slot].label}`);
  };

  const addManualMeal = async (day: number, slot: string) => {
    if (!manualName.trim()) return;
    setAnalyzing(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/food-assistant`;
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: "meal-analyze",
          messages: [{ role: "user", content: `Analyze this dish: ${manualName.trim()}` }],
        }),
      });

      if (!resp.ok) {
        throw new Error("AI analysis request failed");
      }

      let aiResult: any = null;
      if (resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = "";
        let buf = "";

        let done = false;
        while (!done) {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;
          buf += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, idx);
            buf = buf.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(json);
              const c = parsed.choices?.[0]?.delta?.content;
              if (c) fullContent += c;
            } catch {}
          }
        }

        const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResult = JSON.parse(jsonMatch[0]);
        }
      }

      const ingredients: Ingredient[] = aiResult?.ingredients || [];
      const calories = aiResult?.calories || parseInt(manualCalories) || 0;
      const emoji = aiResult?.emoji || "🍽️";

      const meal: PlannedMeal = {
        id: `${Date.now()}-${Math.random()}`,
        name: aiResult?.name || manualName.trim(),
        emoji,
        slot: slot as any,
        day,
        ingredients,
        calories,
        isFromRecipe: false,
      };

      setMeals(prev => [...prev.filter(m => !(m.day === day && m.slot === slot)), meal]);

      // Check pantry and add missing ingredients to shopping list
      const missingIngredients = ingredients.filter(ing => !checkIngredientAvailability(ing.name, pantry));
      if (missingIngredients.length > 0) {
        try {
          const existing = JSON.parse(localStorage.getItem("sp-shopping-extra") || "[]");
          const newItems = missingIngredients.map(ing => ({ name: ing.name, amount: ing.amount }));
          localStorage.setItem("sp-shopping-extra", JSON.stringify([...existing, ...newItems]));
        } catch {}
        toast.success(`${emoji} ${meal.name} added! ${missingIngredients.length} missing ingredients sent to Shopping List`);
      } else {
        toast.success(`${emoji} ${meal.name} added — all ingredients available! 🎉`);
      }
    } catch (err) {
      console.error("AI analysis failed:", err);
      // Fallback: add without AI
      const meal: PlannedMeal = {
        id: `${Date.now()}-${Math.random()}`,
        name: manualName.trim(),
        emoji: "🍽️",
        slot: slot as any,
        day,
        ingredients: [],
        calories: parseInt(manualCalories) || 0,
        isFromRecipe: false,
      };
      setMeals(prev => [...prev.filter(m => !(m.day === day && m.slot === slot)), meal]);
      toast.success(`Meal added to ${DAYS[day]} ${slot}`);
    } finally {
      setAnalyzing(false);
      setManualName("");
      setManualCalories("");
      setShowManualAdd(null);
    }
  };

  const removeMeal = (id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  };

  const getMeal = (day: number, slot: string) => meals.find(m => m.day === day && m.slot === slot);

  const generateShoppingList = () => {
    const allIngredients: Record<string, string> = {};
    meals.forEach(meal => {
      meal.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase();
        if (!checkIngredientAvailability(ing.name, pantry)) {
          allIngredients[key] = ing.amount;
        }
      });
    });
    const missing = Object.entries(allIngredients);
    if (missing.length === 0) {
      toast.success("All ingredients are in your pantry! 🎉");
      return;
    }
    // Save to shopping list localStorage
    try {
      const existing = JSON.parse(localStorage.getItem("sp-shopping-extra") || "[]");
      const newItems = missing.map(([name, amount]) => ({ name, amount }));
      localStorage.setItem("sp-shopping-extra", JSON.stringify([...existing, ...newItems]));
    } catch { /* ignore */ }
    toast.success(`${missing.length} missing ingredients added to Shopping List!`);
  };

  const smartSuggest = async () => {
    setSuggesting(true);
    // Simple logic: suggest recipes using expiring pantry items
    await new Promise(r => setTimeout(r, 800));
    const expiringItems = ["Chicken breast", "Eggs", "Banana"];
    const suggestions = allRecipes.filter(r =>
      r.ingredients.some((ing: any) =>
        expiringItems.some(e => ing.name.toLowerCase().includes(e.toLowerCase()))
      )
    ).slice(0, 3);

    if (suggestions.length > 0) {
      // Auto-fill empty slots
      let filled = 0;
      for (let day = 0; day < 7 && filled < suggestions.length; day++) {
        for (const slot of SLOTS) {
          if (!getMeal(day, slot) && filled < suggestions.length) {
            addMealFromRecipe(suggestions[filled], day, slot);
            filled++;
          }
        }
      }
      toast.success(`🤖 Suggested ${filled} meals based on expiring pantry items!`);
    } else {
      toast.info("No suggestions available right now");
    }
    setSuggesting(false);
  };

  const handleDragStart = (meal: PlannedMeal) => setDragItem(meal);
  const handleDrop = (day: number, slot: string) => {
    if (!dragItem) return;
    setMeals(prev => {
      const filtered = prev.filter(m => m.id !== dragItem.id && !(m.day === day && m.slot === slot));
      return [...filtered, { ...dragItem, day, slot: slot as any, id: `${Date.now()}-${Math.random()}` }];
    });
    setDragItem(null);
    toast.success(`Moved to ${DAYS[day]} ${SLOT_LABELS[slot].label}`);
  };

  const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const avgDaily = meals.length > 0 ? Math.round(totalCalories / 7) : 0;

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="animate-fade-up">
        <h2 className="text-2xl font-bold text-foreground text-balance">Weekly Meal Plan</h2>
        <p className="text-muted-foreground mt-1">Plan meals for the week ahead</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="bg-primary/10 rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">{meals.length}</p>
          <p className="text-[10px] text-muted-foreground">Planned</p>
        </div>
        <div className="bg-success/10 rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">{avgDaily}</p>
          <p className="text-[10px] text-muted-foreground">Avg cal/day</p>
        </div>
        <div className="bg-warning/10 rounded-2xl p-3 text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">{meals.filter(m => m.ingredients.some(i => !checkIngredientAvailability(i.name, pantry))).length}</p>
          <p className="text-[10px] text-muted-foreground">Need items</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <button
          onClick={smartSuggest}
          disabled={suggesting}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
        >
          <Sparkles size={16} className={suggesting ? "animate-spin" : ""} />
          {suggesting ? "Suggesting..." : "Smart Suggest"}
        </button>
        <button
          onClick={generateShoppingList}
          className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97]"
        >
          <ShoppingCart size={16} /> Shopping List
        </button>
      </div>

      {/* Weekly calendar */}
      <div className="space-y-2 animate-fade-up" style={{ animationDelay: "160ms" }}>
        {DAYS.map((day, dayIdx) => {
          const isExpanded = expandedDay === dayIdx;
          const dayMeals = meals.filter(m => m.day === dayIdx);
          const filledSlots = dayMeals.length;

          return (
            <div key={day} className="bg-card border rounded-2xl overflow-hidden transition-all duration-200">
              {/* Day header */}
              <button
                onClick={() => setExpandedDay(isExpanded ? -1 : dayIdx)}
                className="w-full flex items-center justify-between p-3.5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${filledSlots === 3 ? "bg-success/15 text-success" : filledSlots > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {day.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{day}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {filledSlots}/3 meals · {dayMeals.reduce((s, m) => s + m.calories, 0)} cal
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {filledSlots === 3 && <Check size={14} className="text-success" />}
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </button>

              {/* Slots */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 space-y-2">
                  {SLOTS.map(slot => {
                    const meal = getMeal(dayIdx, slot);
                    const slotInfo = SLOT_LABELS[slot];

                    return (
                      <div
                        key={slot}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(dayIdx, slot)}
                        className="bg-muted/50 rounded-xl p-2.5 min-h-[52px] transition-all"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {slotInfo.emoji} {slotInfo.label}
                        </p>

                        {meal ? (
                          <div
                            draggable
                            onDragStart={() => handleDragStart(meal)}
                            className="flex items-center gap-2 bg-card rounded-lg p-2 border cursor-grab active:cursor-grabbing"
                          >
                            <span className="text-lg">{meal.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{meal.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-muted-foreground">{meal.calories} cal</span>
                                {meal.ingredients.length > 0 && (
                                  <>
                                    {meal.ingredients.every(i => checkIngredientAvailability(i.name, pantry)) ? (
                                      <span className="text-[10px] text-success flex items-center gap-0.5"><Check size={8} /> Ready</span>
                                    ) : (
                                      <span className="text-[10px] text-warning flex items-center gap-0.5"><AlertTriangle size={8} /> Missing items</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <button onClick={() => removeMeal(meal.id)} className="text-muted-foreground hover:text-destructive p-1 transition-colors">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => { setShowRecipePicker({ day: dayIdx, slot }); setShowManualAdd(null); }}
                              className="flex-1 flex items-center justify-center gap-1 bg-card border border-dashed rounded-lg p-2 text-[10px] text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                            >
                              <ChefHat size={12} /> From Recipe
                            </button>
                            <button
                              onClick={() => { setShowManualAdd({ day: dayIdx, slot }); setShowRecipePicker(null); }}
                              className="flex-1 flex items-center justify-center gap-1 bg-card border border-dashed rounded-lg p-2 text-[10px] text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                            >
                              <Plus size={12} /> Manual
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recipe picker modal */}
      {showRecipePicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => setShowRecipePicker(null)}>
          <div className="bg-card w-full max-w-lg rounded-t-3xl p-5 max-h-[70vh] overflow-y-auto animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">
                Pick a recipe for {DAYS[showRecipePicker.day]} {SLOT_LABELS[showRecipePicker.slot].label}
              </h3>
              <button onClick={() => setShowRecipePicker(null)} className="text-muted-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              {allRecipes.map((r, i) => (
                <button
                  key={i}
                  onClick={() => addMealFromRecipe(r, showRecipePicker.day, showRecipePicker.slot)}
                  className="w-full flex items-center gap-3 bg-muted/50 rounded-xl p-3 text-left transition-all active:scale-[0.97] hover:bg-muted"
                >
                  <span className="text-xl">{r.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.calories} cal · {r.ingredients.length} ingredients</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual add modal */}
      {showManualAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={() => setShowManualAdd(null)}>
          <div className="bg-card w-full max-w-lg rounded-t-3xl p-5 animate-fade-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">
                Add meal to {DAYS[showManualAdd.day]} {SLOT_LABELS[showManualAdd.slot].label}
              </h3>
              <button onClick={() => setShowManualAdd(null)} className="text-muted-foreground"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                placeholder="Dish name (e.g. Nasi Lemak, Pasta Carbonara)"
                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={analyzing}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveManualMeal(showManualAdd.day, showManualAdd.slot)}
                  disabled={analyzing || !manualName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  <Plus size={16} />
                  Save
                </button>
                <button
                  onClick={() => addManualMeal(showManualAdd.day, showManualAdd.slot)}
                  disabled={analyzing || !manualName.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  {analyzing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Analyze & Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
