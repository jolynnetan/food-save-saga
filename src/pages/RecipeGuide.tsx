import { useState } from "react";
import { ChefHat, ArrowRight, ArrowLeft, Flame, Check, RotateCcw } from "lucide-react";

type DietaryPref = "vegetarian" | "vegan" | "halal" | "gluten-free" | "dairy-free" | "none";
type CuisinePref = "asian" | "western" | "mediterranean" | "indian" | "mexican" | "any";

type Recipe = {
  name: string;
  emoji: string;
  cuisine: string;
  diet: string[];
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: number;
  ingredients: { name: string; amount: string; cal: number }[];
  steps: string[];
};

const allRecipes: Recipe[] = [
  {
    name: "Thai Basil Stir-Fry", emoji: "🍜", cuisine: "asian", diet: ["gluten-free", "dairy-free", "none"],
    time: "20 min", calories: 380, protein: 28, carbs: 35, fat: 12, servings: 2,
    ingredients: [
      { name: "Chicken breast", amount: "300g", cal: 165 }, { name: "Thai basil", amount: "1 cup", cal: 5 },
      { name: "Jasmine rice", amount: "200g", cal: 260 }, { name: "Soy sauce", amount: "2 tbsp", cal: 17 },
      { name: "Garlic", amount: "3 cloves", cal: 13 }, { name: "Chili", amount: "2 pcs", cal: 8 },
    ],
    steps: ["Cook rice according to package instructions.", "Slice chicken into thin strips and season with soy sauce.", "Heat oil in wok over high heat. Stir-fry garlic and chili for 30 seconds.", "Add chicken, cook 4-5 minutes until golden.", "Toss in Thai basil leaves, stir until wilted.", "Serve over jasmine rice. Garnish with extra basil."],
  },
  {
    name: "Mediterranean Quinoa Bowl", emoji: "🥗", cuisine: "mediterranean", diet: ["vegetarian", "gluten-free", "none"],
    time: "25 min", calories: 420, protein: 18, carbs: 52, fat: 16, servings: 2,
    ingredients: [
      { name: "Quinoa", amount: "150g", cal: 180 }, { name: "Cherry tomatoes", amount: "200g", cal: 36 },
      { name: "Cucumber", amount: "1 medium", cal: 16 }, { name: "Feta cheese", amount: "60g", cal: 160 },
      { name: "Olive oil", amount: "2 tbsp", cal: 240 }, { name: "Kalamata olives", amount: "50g", cal: 60 },
    ],
    steps: ["Cook quinoa in salted water for 15 minutes, then fluff.", "Halve the cherry tomatoes and dice the cucumber.", "Crumble feta cheese over the quinoa.", "Add olives, tomatoes, and cucumber.", "Drizzle with olive oil and lemon juice.", "Season with oregano, salt, and pepper. Toss gently."],
  },
  {
    name: "Chickpea Tikka Masala", emoji: "🍛", cuisine: "indian", diet: ["vegan", "vegetarian", "gluten-free", "none"],
    time: "35 min", calories: 340, protein: 14, carbs: 45, fat: 11, servings: 3,
    ingredients: [
      { name: "Chickpeas (canned)", amount: "400g", cal: 210 }, { name: "Coconut milk", amount: "200ml", cal: 190 },
      { name: "Tomato puree", amount: "200g", cal: 40 }, { name: "Onion", amount: "1 large", cal: 44 },
      { name: "Garam masala", amount: "2 tsp", cal: 15 }, { name: "Basmati rice", amount: "200g", cal: 260 },
    ],
    steps: ["Cook basmati rice. Dice onion finely.", "Sauté onion in oil until translucent, about 5 minutes.", "Add garam masala, cumin, and turmeric. Cook 1 minute.", "Pour in tomato puree and coconut milk. Simmer 10 minutes.", "Add drained chickpeas. Simmer another 10 minutes.", "Serve over rice with fresh cilantro on top."],
  },
  {
    name: "Grilled Salmon & Greens", emoji: "🐟", cuisine: "western", diet: ["gluten-free", "dairy-free", "none"],
    time: "20 min", calories: 450, protein: 38, carbs: 12, fat: 28, servings: 2,
    ingredients: [
      { name: "Salmon fillets", amount: "2 pcs (300g)", cal: 400 }, { name: "Mixed greens", amount: "150g", cal: 20 },
      { name: "Avocado", amount: "1 medium", cal: 240 }, { name: "Lemon", amount: "1 pc", cal: 17 },
      { name: "Olive oil", amount: "1 tbsp", cal: 120 }, { name: "Cherry tomatoes", amount: "100g", cal: 18 },
    ],
    steps: ["Season salmon with salt, pepper, and lemon zest.", "Heat grill pan over medium-high heat.", "Grill salmon skin-side down for 4 minutes, flip, cook 3 more.", "Arrange mixed greens on plates.", "Slice avocado and halve tomatoes over greens.", "Place salmon on top. Drizzle with olive oil and lemon juice."],
  },
  {
    name: "Black Bean Tacos", emoji: "🌮", cuisine: "mexican", diet: ["vegan", "vegetarian", "none"],
    time: "15 min", calories: 320, protein: 12, carbs: 48, fat: 9, servings: 2,
    ingredients: [
      { name: "Corn tortillas", amount: "6 pcs", cal: 180 }, { name: "Black beans", amount: "300g", cal: 210 },
      { name: "Avocado", amount: "1 medium", cal: 240 }, { name: "Lime", amount: "2 pcs", cal: 20 },
      { name: "Red onion", amount: "1 small", cal: 28 }, { name: "Cilantro", amount: "1 bunch", cal: 4 },
    ],
    steps: ["Heat black beans in a pan with cumin and chili powder.", "Warm tortillas in a dry skillet for 30 seconds each.", "Mash avocado with lime juice and salt for quick guac.", "Dice red onion and chop cilantro.", "Spoon beans onto tortillas, top with guacamole.", "Garnish with onion, cilantro, and extra lime."],
  },
  {
    name: "Tofu Poke Bowl", emoji: "🍣", cuisine: "asian", diet: ["vegan", "vegetarian", "dairy-free", "none"],
    time: "25 min", calories: 390, protein: 20, carbs: 50, fat: 13, servings: 2,
    ingredients: [
      { name: "Firm tofu", amount: "300g", cal: 210 }, { name: "Sushi rice", amount: "200g", cal: 260 },
      { name: "Edamame", amount: "100g", cal: 120 }, { name: "Cucumber", amount: "1 medium", cal: 16 },
      { name: "Soy sauce", amount: "3 tbsp", cal: 25 }, { name: "Sesame oil", amount: "1 tbsp", cal: 120 },
    ],
    steps: ["Cook sushi rice and season with rice vinegar.", "Cube tofu and marinate in soy sauce + sesame oil for 10 min.", "Pan-fry tofu cubes until golden, about 4 minutes per side.", "Slice cucumber into thin rounds.", "Arrange rice in bowls, top with tofu, edamame, cucumber.", "Drizzle with extra soy sauce and sprinkle sesame seeds."],
  },
];

const dietOptions: { key: DietaryPref; label: string; emoji: string }[] = [
  { key: "none", label: "No restriction", emoji: "🍽️" },
  { key: "vegetarian", label: "Vegetarian", emoji: "🥬" },
  { key: "vegan", label: "Vegan", emoji: "🌱" },
  { key: "halal", label: "Halal", emoji: "☪️" },
  { key: "gluten-free", label: "Gluten-free", emoji: "🌾" },
  { key: "dairy-free", label: "Dairy-free", emoji: "🥛" },
];

const cuisineOptions: { key: CuisinePref; label: string; emoji: string }[] = [
  { key: "any", label: "Any cuisine", emoji: "🌍" },
  { key: "asian", label: "Asian", emoji: "🥢" },
  { key: "western", label: "Western", emoji: "🍔" },
  { key: "mediterranean", label: "Mediterranean", emoji: "🫒" },
  { key: "indian", label: "Indian", emoji: "🍛" },
  { key: "mexican", label: "Mexican", emoji: "🌮" },
];

export default function RecipeGuide() {
  const [step, setStep] = useState(0); // 0=diet, 1=cuisine, 2=results, 3=recipe detail
  const [diet, setDiet] = useState<DietaryPref>("none");
  const [cuisine, setCuisine] = useState<CuisinePref>("any");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const filteredRecipes = allRecipes.filter((r) => {
    const dietMatch = diet === "none" || r.diet.includes(diet);
    const cuisineMatch = cuisine === "any" || r.cuisine === cuisine;
    return dietMatch && cuisineMatch;
  });

  const reset = () => {
    setStep(0);
    setDiet("none");
    setCuisine("any");
    setSelectedRecipe(null);
    setCurrentStep(0);
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-up">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Recipe Guide</h2>
          <p className="text-muted-foreground mt-1">
            {step === 0 && "Step 1: Choose your dietary preference"}
            {step === 1 && "Step 2: Pick your cuisine"}
            {step === 2 && `${filteredRecipes.length} recipes found`}
            {step === 3 && selectedRecipe?.name}
          </p>
        </div>
        {step > 0 && (
          <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="flex gap-2 animate-fade-up" style={{ animationDelay: "60ms" }}>
        {["Diet", "Cuisine", "Recipes", "Cook"].map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-muted"}`} />
            <p className={`text-[10px] mt-1 text-center font-medium ${i <= step ? "text-primary" : "text-muted-foreground"}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Step 0: Diet selection */}
      {step === 0 && (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {dietOptions.map((d) => (
            <button
              key={d.key}
              onClick={() => setDiet(d.key)}
              className={`w-full text-left flex items-center gap-3 rounded-xl p-4 transition-all duration-200 active:scale-[0.97] ${
                diet === d.key ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-card border text-foreground"
              }`}
            >
              <span className="text-xl">{d.emoji}</span>
              <span className="text-sm font-medium">{d.label}</span>
              {diet === d.key && <Check size={16} className="ml-auto" />}
            </button>
          ))}
          <button
            onClick={() => setStep(1)}
            className="w-full bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-lg shadow-primary/20"
          >
            Next <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Step 1: Cuisine selection */}
      {step === 1 && (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {cuisineOptions.map((c) => (
            <button
              key={c.key}
              onClick={() => setCuisine(c.key)}
              className={`w-full text-left flex items-center gap-3 rounded-xl p-4 transition-all duration-200 active:scale-[0.97] ${
                cuisine === c.key ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-card border text-foreground"
              }`}
            >
              <span className="text-xl">{c.emoji}</span>
              <span className="text-sm font-medium">{c.label}</span>
              {cuisine === c.key && <Check size={16} className="ml-auto" />}
            </button>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setStep(0)} className="flex-1 bg-muted text-muted-foreground rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setStep(2)} className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] shadow-lg shadow-primary/20">
              Find Recipes <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Recipe results */}
      {step === 2 && (
        <div className="space-y-3 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">🍽️</p>
              <p className="text-sm text-muted-foreground">No recipes match your filters. Try different preferences!</p>
              <button onClick={reset} className="mt-3 text-sm text-primary font-medium">Start over</button>
            </div>
          ) : (
            filteredRecipes.map((recipe) => (
              <button
                key={recipe.name}
                onClick={() => { setSelectedRecipe(recipe); setCurrentStep(0); setStep(3); }}
                className="w-full text-left flex items-center gap-3 bg-card border rounded-xl p-4 transition-all duration-200 active:scale-[0.97]"
              >
                <span className="text-2xl">{recipe.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{recipe.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span>⏱ {recipe.time}</span>
                    <span className="flex items-center gap-1"><Flame size={10} className="text-streak" /> {recipe.calories} cal</span>
                    <span>🍽 {recipe.servings} servings</span>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))
          )}
          <button onClick={() => setStep(1)} className="w-full bg-muted text-muted-foreground rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97]">
            <ArrowLeft size={16} /> Change preferences
          </button>
        </div>
      )}

      {/* Step 3: Recipe detail with step-by-step */}
      {step === 3 && selectedRecipe && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
          {/* Calorie breakdown */}
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Flame size={16} className="text-streak" /> Nutrition per serving
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: "Calories", value: `${selectedRecipe.calories}`, unit: "kcal", color: "text-streak" },
                { label: "Protein", value: `${selectedRecipe.protein}`, unit: "g", color: "text-primary" },
                { label: "Carbs", value: `${selectedRecipe.carbs}`, unit: "g", color: "text-warning" },
                { label: "Fat", value: `${selectedRecipe.fat}`, unit: "g", color: "text-destructive" },
              ].map((n) => (
                <div key={n.label}>
                  <p className={`text-lg font-bold tabular-nums ${n.color}`}>{n.value}</p>
                  <p className="text-[10px] text-muted-foreground">{n.unit}</p>
                  <p className="text-[10px] text-muted-foreground">{n.label}</p>
                </div>
              ))}
            </div>
            {/* Calorie bar */}
            <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-muted">
              <div className="bg-primary" style={{ width: `${(selectedRecipe.protein * 4 / (selectedRecipe.calories)) * 100}%` }} />
              <div className="bg-warning" style={{ width: `${(selectedRecipe.carbs * 4 / (selectedRecipe.calories)) * 100}%` }} />
              <div className="bg-destructive" style={{ width: `${(selectedRecipe.fat * 9 / (selectedRecipe.calories)) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground">
              <span>Protein {Math.round((selectedRecipe.protein * 4 / selectedRecipe.calories) * 100)}%</span>
              <span>Carbs {Math.round((selectedRecipe.carbs * 4 / selectedRecipe.calories) * 100)}%</span>
              <span>Fat {Math.round((selectedRecipe.fat * 9 / selectedRecipe.calories) * 100)}%</span>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">📋 Ingredients</h3>
            <div className="space-y-2">
              {selectedRecipe.ingredients.map((ing) => (
                <div key={ing.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{ing.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{ing.cal} cal</span>
                    <span className="font-medium text-foreground tabular-nums">{ing.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-step cooking */}
          <div className="bg-card border rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ChefHat size={16} className="text-primary" /> Step {currentStep + 1} of {selectedRecipe.steps.length}
            </h3>
            <div className="bg-muted rounded-xl p-4 mb-4">
              <p className="text-sm text-foreground leading-relaxed">
                {selectedRecipe.steps[currentStep]}
              </p>
            </div>

            {/* Step progress dots */}
            <div className="flex justify-center gap-2 mb-4">
              {selectedRecipe.steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentStep ? "bg-primary scale-125" : i < currentStep ? "bg-primary/40" : "bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex-1 bg-muted text-muted-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.97] disabled:opacity-30"
              >
                <ArrowLeft size={14} /> Prev
              </button>
              {currentStep < selectedRecipe.steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.97]"
                >
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={reset}
                  className="flex-1 bg-success text-success-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.97]"
                >
                  <Check size={14} /> Done!
                </button>
              )}
            </div>
          </div>

          <button onClick={() => setStep(2)} className="w-full text-sm text-primary font-medium py-2">
            ← Back to recipes
          </button>
        </div>
      )}
    </div>
  );
}
