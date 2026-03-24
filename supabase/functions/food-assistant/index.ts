import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, imageBase64 } = await req.json();
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

    if (mode === "scan-leftovers") {
      systemPrompt = `You are a food identification and waste reduction AI. Analyze the image provided and identify ALL food items visible.
For each item, estimate its calories and macros. Determine if it's a leftover (cooked, partially eaten, stored in container) or fresh.
Return ONLY a JSON object with this exact structure, no other text:
{
  "items": [
    {"name": "Food name", "emoji": "🍚", "calories": 200, "protein": 5, "carbs": 40, "fat": 1, "quantity": "1 bowl (~200g)", "isLeftover": true}
  ],
  "totalCalories": 500,
  "leftoversCount": 2,
  "freshCount": 1,
  "wasteReductionTips": [
    {"tip": "Practical tip to reduce or reuse this leftover", "icon": "recycle"},
    {"tip": "Storage advice", "icon": "fridge"}
  ],
  "recipeSuggestions": [
    {"name": "Recipe Name", "emoji": "🍳", "time": "15 min", "description": "Brief description using detected items"}
  ]
}
Set isLeftover to true if the item appears to be a leftover (cooked food, partially eaten, stored in containers, etc). Provide 3-5 waste reduction tips and 2-3 recipe suggestions using the detected items. Be accurate with calorie estimates.`;
    }

    // Build messages array with vision support
    let aiMessages: any[];
    if (imageBase64 && (mode === "scan-leftovers" || mode === "scan-calories")) {
      // Extract mime type and base64 data from data URL
      const mimeMatch = imageBase64.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        const base64Data = mimeMatch[2];
        aiMessages = [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
              { type: "text", text: "Analyze this food image. Identify all visible food items, estimate calories, determine which are fresh and which are leftovers." },
            ],
          },
        ];
      } else {
        aiMessages = [
          { role: "system", content: systemPrompt },
          ...(messages || [{ role: "user", content: "Analyze common household food items." }]),
        ];
      }
    } else {
      aiMessages = [
        { role: "system", content: systemPrompt },
        ...(messages || []),
      ];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        stream: true,
        max_tokens: 4096,
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
