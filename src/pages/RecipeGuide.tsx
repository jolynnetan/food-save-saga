import { useState } from "react";
import { ChefHat, ArrowRight, ArrowLeft, Flame, Check, RotateCcw, Upload, Loader2, Sparkles } from "lucide-react";
import { usePoints } from "@/contexts/PointsContext";
import { toast } from "sonner";

type DietaryPref = "vegetarian" | "vegan" | "halal" | "gluten-free" | "dairy-free" | "none";
type CuisinePref = "asian" | "western" | "mediterranean" | "indian" | "mexican" | "middle-eastern" | "japanese" | "korean" | "any";

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
  isUserRecipe?: boolean;
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
  {
    name: "Lamb Shawarma Wrap", emoji: "🥙", cuisine: "middle-eastern", diet: ["halal", "dairy-free", "none"],
    time: "30 min", calories: 520, protein: 32, carbs: 42, fat: 22, servings: 2,
    ingredients: [
      { name: "Lamb leg (sliced)", amount: "300g", cal: 250 }, { name: "Pita bread", amount: "2 large", cal: 170 },
      { name: "Tahini", amount: "2 tbsp", cal: 90 }, { name: "Pickled turnip", amount: "50g", cal: 10 },
      { name: "Tomato", amount: "1 medium", cal: 22 }, { name: "Sumac & cumin", amount: "1 tsp each", cal: 8 },
    ],
    steps: ["Marinate lamb slices in sumac, cumin, garlic, and olive oil for 15 min.", "Pan-sear lamb over high heat 3-4 minutes per side.", "Warm pita bread briefly on the pan.", "Dice tomato and slice pickled turnips.", "Spread tahini on pita, layer lamb, tomato, pickles.", "Roll tightly, slice in half, and serve."],
  },
  {
    name: "Japanese Miso Ramen", emoji: "🍜", cuisine: "japanese", diet: ["dairy-free", "none"],
    time: "25 min", calories: 440, protein: 26, carbs: 52, fat: 14, servings: 2,
    ingredients: [
      { name: "Ramen noodles", amount: "200g", cal: 280 }, { name: "White miso paste", amount: "3 tbsp", cal: 70 },
      { name: "Soft-boiled eggs", amount: "2 pcs", cal: 144 }, { name: "Spring onions", amount: "3 stalks", cal: 5 },
      { name: "Corn kernels", amount: "100g", cal: 86 }, { name: "Nori sheets", amount: "4 pcs", cal: 10 },
    ],
    steps: ["Bring 800ml water to boil, dissolve miso paste and soy sauce.", "Cook ramen noodles according to package, drain.", "Soft-boil eggs: cook 6.5 minutes, ice bath, peel and halve.", "Slice spring onions and prepare corn.", "Divide noodles into bowls, ladle hot miso broth over.", "Top with egg halves, corn, nori, and spring onions."],
  },
  {
    name: "Korean Bibimbap", emoji: "🍚", cuisine: "korean", diet: ["gluten-free", "none"],
    time: "35 min", calories: 480, protein: 28, carbs: 58, fat: 15, servings: 2,
    ingredients: [
      { name: "Short grain rice", amount: "200g", cal: 260 }, { name: "Beef mince", amount: "200g", cal: 250 },
      { name: "Spinach", amount: "150g", cal: 23 }, { name: "Carrots", amount: "1 medium", cal: 25 },
      { name: "Gochujang", amount: "2 tbsp", cal: 40 }, { name: "Sesame oil", amount: "1 tbsp", cal: 120 },
    ],
    steps: ["Cook rice. Season beef with soy sauce and sesame oil, sauté 5 min.", "Blanch spinach, squeeze dry, season with sesame oil and garlic.", "Julienne carrots, sauté until tender.", "Fry an egg sunny-side up per bowl.", "Arrange rice in bowls, place veggies and beef in sections around edge.", "Top with fried egg, drizzle gochujang. Mix everything before eating."],
  },
  {
    name: "Falafel Bowl", emoji: "🧆", cuisine: "middle-eastern", diet: ["vegan", "vegetarian", "halal", "dairy-free", "none"],
    time: "30 min", calories: 410, protein: 16, carbs: 50, fat: 18, servings: 2,
    ingredients: [
      { name: "Canned chickpeas", amount: "400g", cal: 210 }, { name: "Fresh parsley", amount: "1 cup", cal: 11 },
      { name: "Couscous", amount: "150g", cal: 180 }, { name: "Tahini", amount: "2 tbsp", cal: 90 },
      { name: "Lemon", amount: "1 pc", cal: 17 }, { name: "Cucumber", amount: "1 medium", cal: 16 },
    ],
    steps: ["Blend chickpeas, parsley, cumin, and garlic into a thick paste.", "Form into small patties and pan-fry 3 min per side until golden.", "Cook couscous: pour boiling water over, cover 5 min, fluff.", "Make dressing: whisk tahini, lemon juice, water, and salt.", "Dice cucumber. Arrange couscous, falafel, cucumber in bowls.", "Drizzle tahini dressing generously and serve."],
  },
  {
    name: "Pasta Primavera", emoji: "🍝", cuisine: "western", diet: ["vegetarian", "none"],
    time: "20 min", calories: 460, protein: 16, carbs: 62, fat: 16, servings: 2,
    ingredients: [
      { name: "Penne pasta", amount: "200g", cal: 350 }, { name: "Zucchini", amount: "1 medium", cal: 33 },
      { name: "Bell pepper", amount: "1 large", cal: 31 }, { name: "Parmesan", amount: "30g", cal: 120 },
      { name: "Olive oil", amount: "2 tbsp", cal: 240 }, { name: "Cherry tomatoes", amount: "150g", cal: 27 },
    ],
    steps: ["Cook penne in salted water until al dente.", "Slice zucchini and bell pepper into strips.", "Sauté vegetables in olive oil with garlic for 5 minutes.", "Halve cherry tomatoes, add to pan, cook 2 minutes.", "Toss drained pasta with vegetables.", "Grate parmesan over top, season with basil and pepper."],
  },
  {
    name: "Chicken Burrito Bowl", emoji: "🌯", cuisine: "mexican", diet: ["gluten-free", "halal", "dairy-free", "none"],
    time: "25 min", calories: 510, protein: 35, carbs: 55, fat: 16, servings: 2,
    ingredients: [
      { name: "Chicken thigh", amount: "300g", cal: 280 }, { name: "Brown rice", amount: "200g", cal: 220 },
      { name: "Black beans", amount: "200g", cal: 140 }, { name: "Corn", amount: "100g", cal: 86 },
      { name: "Lime", amount: "2 pcs", cal: 20 }, { name: "Avocado", amount: "1 medium", cal: 240 },
    ],
    steps: ["Season chicken with cumin, paprika, chili, and lime juice.", "Grill or pan-fry chicken 5-6 min per side, then slice.", "Cook brown rice according to package.", "Warm black beans with a pinch of cumin.", "Arrange rice in bowls, top with chicken, beans, corn.", "Slice avocado on top, squeeze lime, add hot sauce to taste."],
  },
  {
    name: "Vegetable Pad Thai", emoji: "🥡", cuisine: "asian", diet: ["vegan", "vegetarian", "dairy-free", "none"],
    time: "20 min", calories: 370, protein: 12, carbs: 55, fat: 12, servings: 2,
    ingredients: [
      { name: "Rice noodles", amount: "200g", cal: 210 }, { name: "Bean sprouts", amount: "100g", cal: 31 },
      { name: "Peanuts", amount: "30g", cal: 170 }, { name: "Tofu", amount: "150g", cal: 120 },
      { name: "Tamarind paste", amount: "2 tbsp", cal: 30 }, { name: "Lime", amount: "1 pc", cal: 10 },
    ],
    steps: ["Soak rice noodles in warm water for 10 minutes.", "Mix tamarind paste, soy sauce, sugar, and chili for the sauce.", "Press and cube tofu, fry until crispy 4 min per side.", "Stir-fry noodles with sauce in a hot wok for 2 minutes.", "Add bean sprouts, toss briefly to keep crunchy.", "Serve topped with crushed peanuts and lime wedges."],
  },
  {
    name: "Dal Tadka", emoji: "🍲", cuisine: "indian", diet: ["vegan", "vegetarian", "gluten-free", "halal", "dairy-free", "none"],
    time: "30 min", calories: 290, protein: 16, carbs: 42, fat: 6, servings: 3,
    ingredients: [
      { name: "Yellow lentils", amount: "200g", cal: 340 }, { name: "Tomatoes", amount: "2 medium", cal: 44 },
      { name: "Onion", amount: "1 medium", cal: 44 }, { name: "Turmeric", amount: "1 tsp", cal: 8 },
      { name: "Cumin seeds", amount: "1 tsp", cal: 8 }, { name: "Ghee or oil", amount: "1 tbsp", cal: 120 },
    ],
    steps: ["Wash lentils and pressure cook with turmeric and water for 15 min.", "Dice onion and tomatoes finely.", "Heat ghee, add cumin seeds until they splutter.", "Add onion, cook until golden. Add tomatoes and cook 5 min.", "Pour the tadka (tempering) over cooked dal.", "Stir well, garnish with cilantro. Serve with rice or roti."],
  },
  {
    name: "Caprese Sandwich", emoji: "🥪", cuisine: "mediterranean", diet: ["vegetarian", "none"],
    time: "10 min", calories: 380, protein: 18, carbs: 32, fat: 20, servings: 1,
    ingredients: [
      { name: "Ciabatta bread", amount: "1 roll", cal: 200 }, { name: "Fresh mozzarella", amount: "80g", cal: 180 },
      { name: "Tomato", amount: "1 large", cal: 22 }, { name: "Fresh basil", amount: "6 leaves", cal: 2 },
      { name: "Balsamic glaze", amount: "1 tbsp", cal: 20 }, { name: "Olive oil", amount: "1 tsp", cal: 40 },
    ],
    steps: ["Slice ciabatta in half horizontally.", "Layer thick slices of mozzarella and tomato.", "Tuck fresh basil leaves between layers.", "Drizzle with olive oil and balsamic glaze.", "Season with salt and cracked black pepper.", "Press gently, slice diagonally, and serve."],
  },
  {
    name: "Teriyaki Salmon Bowl", emoji: "🐟", cuisine: "japanese", diet: ["dairy-free", "none"],
    time: "25 min", calories: 490, protein: 34, carbs: 52, fat: 16, servings: 2,
    ingredients: [
      { name: "Salmon fillets", amount: "250g", cal: 310 }, { name: "Sushi rice", amount: "200g", cal: 260 },
      { name: "Soy sauce", amount: "3 tbsp", cal: 25 }, { name: "Mirin", amount: "2 tbsp", cal: 30 },
      { name: "Edamame", amount: "80g", cal: 96 }, { name: "Pickled ginger", amount: "20g", cal: 4 },
    ],
    steps: ["Cook sushi rice and season with rice vinegar.", "Mix soy sauce, mirin, and brown sugar for teriyaki glaze.", "Pan-sear salmon 3 min per side, brush with teriyaki in last minute.", "Steam edamame for 3 minutes.", "Divide rice into bowls, place salmon on top.", "Add edamame, pickled ginger, and drizzle remaining glaze."],
  },
  {
    name: "Kimchi Fried Rice", emoji: "🍳", cuisine: "korean", diet: ["dairy-free", "none"],
    time: "15 min", calories: 420, protein: 18, carbs: 58, fat: 12, servings: 2,
    ingredients: [
      { name: "Day-old rice", amount: "400g", cal: 520 }, { name: "Kimchi", amount: "150g", cal: 20 },
      { name: "Eggs", amount: "2 pcs", cal: 144 }, { name: "Sesame oil", amount: "1 tbsp", cal: 120 },
      { name: "Gochujang", amount: "1 tbsp", cal: 20 }, { name: "Spring onions", amount: "3 stalks", cal: 5 },
    ],
    steps: ["Chop kimchi into small pieces, reserve the juice.", "Heat sesame oil in a large wok or pan.", "Fry kimchi 2 minutes, add gochujang and kimchi juice.", "Add cold rice, stir-fry on high heat 3-4 minutes.", "Push rice aside, fry eggs sunny-side up in the same pan.", "Plate rice, top with egg, garnish with spring onions and sesame seeds."],
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
  { key: "middle-eastern", label: "Middle Eastern", emoji: "🥙" },
  { key: "japanese", label: "Japanese", emoji: "🍱" },
  { key: "korean", label: "Korean", emoji: "🥘" },
];

export default function RecipeGuide() {
  const [step, setStep] = useState(0);
  const [diet, setDiet] = useState<DietaryPref>("none");
  const [cuisine, setCuisine] = useState<CuisinePref>("any");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: "", ingredients: "", steps: "" });
  const [analyzing, setAnalyzing] = useState(false);
  const { addPoints } = usePoints();

  const combinedRecipes = [...allRecipes, ...userRecipes];

  const filteredRecipes = combinedRecipes.filter((r) => {
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
    setShowUpload(false);
  };

  const analyzeAndAddRecipe = async () => {
    if (!uploadForm.name.trim() || !uploadForm.ingredients.trim() || !uploadForm.steps.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setAnalyzing(true);
    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/food-assistant`;
      const prompt = `Analyze this recipe and estimate the nutrition per serving. Return ONLY a JSON object (no markdown).
Recipe: ${uploadForm.name}
Ingredients: ${uploadForm.ingredients}
Steps: ${uploadForm.steps}

Return JSON: {"calories":number,"protein":number,"carbs":number,"fat":number,"servings":number,"time":"X min","ingredients":[{"name":"...","amount":"...","cal":number}]}`;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          mode: "scan-calories",
        }),
      });

      if (!resp.ok) throw new Error("AI analysis failed");

      const reader = resp.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullText += content;
            } catch { /* skip */ }
          }
        }
      }

      // Try to parse the AI response
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse nutrition data");

      const nutrition = JSON.parse(jsonMatch[0]);
      const stepsArr = uploadForm.steps.split(/\n|\./).map(s => s.trim()).filter(Boolean);
      const ingredientsList = nutrition.ingredients || uploadForm.ingredients.split(/\n|,/).map((ing: string) => ({
        name: ing.trim(), amount: "", cal: 0,
      }));

      const newRecipe: Recipe = {
        name: uploadForm.name,
        emoji: "👨‍🍳",
        cuisine: "any",
        diet: ["none"],
        time: nutrition.time || "30 min",
        calories: nutrition.calories || 0,
        protein: nutrition.protein || 0,
        carbs: nutrition.carbs || 0,
        fat: nutrition.fat || 0,
        servings: nutrition.servings || 1,
        ingredients: ingredientsList,
        steps: stepsArr.length > 0 ? stepsArr : [uploadForm.steps],
        isUserRecipe: true,
      };

      setUserRecipes(prev => [...prev, newRecipe]);
      addPoints(25);
      toast.success("Recipe added! +25 pts 🎉");
      setUploadForm({ name: "", ingredients: "", steps: "" });
      setShowUpload(false);
    } catch (err) {
      console.error(err);
      // Fallback: add without AI analysis
      const stepsArr = uploadForm.steps.split(/\n|\./).map(s => s.trim()).filter(Boolean);
      const ingredientsList = uploadForm.ingredients.split(/\n|,/).map((ing) => ({
        name: ing.trim(), amount: "", cal: 0,
      }));

      const newRecipe: Recipe = {
        name: uploadForm.name, emoji: "👨‍🍳", cuisine: "any", diet: ["none"],
        time: "30 min", calories: 0, protein: 0, carbs: 0, fat: 0, servings: 1,
        ingredients: ingredientsList, steps: stepsArr.length > 0 ? stepsArr : [uploadForm.steps],
        isUserRecipe: true,
      };
      setUserRecipes(prev => [...prev, newRecipe]);
      addPoints(15);
      toast.success("Recipe added (without analysis)! +15 pts");
      setUploadForm({ name: "", ingredients: "", steps: "" });
      setShowUpload(false);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5 pb-28">
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
        <div className="flex items-center gap-2">
          {step === 2 && (
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-primary/10 text-primary active:scale-95 transition-transform"
            >
              <Upload size={14} /> Upload
            </button>
          )}
          {step > 0 && (
            <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw size={18} />
            </button>
          )}
        </div>
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

      {/* Upload Recipe Form */}
      {showUpload && step === 2 && (
        <div className="bg-card border rounded-2xl p-4 space-y-3 animate-fade-up">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Upload Your Recipe</h3>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">+25 pts</span>
          </div>
          <input
            value={uploadForm.name}
            onChange={(e) => setUploadForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Recipe name"
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <textarea
            value={uploadForm.ingredients}
            onChange={(e) => setUploadForm(f => ({ ...f, ingredients: e.target.value }))}
            placeholder="Ingredients (one per line or comma-separated)"
            rows={3}
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <textarea
            value={uploadForm.steps}
            onChange={(e) => setUploadForm(f => ({ ...f, steps: e.target.value }))}
            placeholder="Steps (one per line or separated by periods)"
            rows={3}
            className="w-full bg-muted rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <button
            onClick={analyzeAndAddRecipe}
            disabled={analyzing}
            className="w-full bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] disabled:opacity-60"
          >
            {analyzing ? <><Loader2 size={16} className="animate-spin" /> Analyzing…</> : <><Sparkles size={16} /> Analyze & Add Recipe</>}
          </button>
        </div>
      )}

      {/* Step 0: Diet */}
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

      {/* Step 1: Cuisine */}
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

      {/* Step 2: Results */}
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{recipe.name}</p>
                    {recipe.isUserRecipe && (
                      <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">yours</span>
                    )}
                  </div>
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

      {/* Step 3: Recipe detail */}
      {step === 3 && selectedRecipe && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
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
            {selectedRecipe.calories > 0 && (
              <>
                <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-muted">
                  <div className="bg-primary" style={{ width: `${(selectedRecipe.protein * 4 / selectedRecipe.calories) * 100}%` }} />
                  <div className="bg-warning" style={{ width: `${(selectedRecipe.carbs * 4 / selectedRecipe.calories) * 100}%` }} />
                  <div className="bg-destructive" style={{ width: `${(selectedRecipe.fat * 9 / selectedRecipe.calories) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground">
                  <span>Protein {Math.round((selectedRecipe.protein * 4 / selectedRecipe.calories) * 100)}%</span>
                  <span>Carbs {Math.round((selectedRecipe.carbs * 4 / selectedRecipe.calories) * 100)}%</span>
                  <span>Fat {Math.round((selectedRecipe.fat * 9 / selectedRecipe.calories) * 100)}%</span>
                </div>
              </>
            )}
          </div>

          <div className="bg-card border rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">📋 Ingredients</h3>
            <div className="space-y-2">
              {selectedRecipe.ingredients.map((ing) => (
                <div key={ing.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{ing.name}</span>
                  <div className="flex items-center gap-3">
                    {ing.cal > 0 && <span className="text-xs text-muted-foreground">{ing.cal} cal</span>}
                    <span className="font-medium text-foreground tabular-nums">{ing.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ChefHat size={16} className="text-primary" /> Step {currentStep + 1} of {selectedRecipe.steps.length}
            </h3>
            <div className="bg-muted rounded-xl p-4 mb-4">
              <p className="text-sm text-foreground leading-relaxed">
                {selectedRecipe.steps[currentStep]}
              </p>
            </div>
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
