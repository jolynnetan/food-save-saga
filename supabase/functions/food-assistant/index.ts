import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = `You are a friendly food security assistant called "FoodSaver AI". You help users with:
- Reducing food waste with practical tips
- Suggesting recipes from ingredients they have
- Answering nutrition and calorie questions
- Providing food storage and preservation advice
- Encouraging sustainable eating habits

Keep answers concise, friendly, and actionable. Use emojis sparingly for warmth.`;

    if (mode === "scan-calories") {
      systemPrompt = `You are a food calorie estimation AI. The user will describe food they see or have photographed. 
Estimate the calories and macronutrients (protein, carbs, fat) for each item.
Return your response as a JSON object with this structure:
{"items": [{"name": "Food name", "calories": 200, "protein": 10, "carbs": 25, "fat": 8, "emoji": "🍕"}], "total": {"calories": 200, "protein": 10, "carbs": 25, "fat": 8}}
Only return the JSON, no other text.`;
    }

    if (mode === "meal-analyze") {
      systemPrompt = `You are a meal nutrition and ingredient analysis AI. The user will give you a dish name.
Estimate the total calories and list the key ingredients with their amounts and individual calories.
Also suggest an appropriate emoji for the dish.
Return ONLY a JSON object with this exact structure, no other text:
{"name": "Dish Name", "emoji": "🍛", "calories": 450, "ingredients": [{"name": "Ingredient", "amount": "200g", "cal": 150}]}
Keep ingredients to 4-8 items. Use common household amounts.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("food-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
