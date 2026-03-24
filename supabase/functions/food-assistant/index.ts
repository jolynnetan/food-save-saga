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
      systemPrompt = `You are a food identification and waste reduction AI. Analyze the provided image (or description) of food items.
Identify EVERY visible food item individually. For each item estimate calories, protein, carbs, fat, and quantity.
Mark items as leftover (cooked, partially eaten, stored in containers) or fresh.

Return ONLY a JSON object with this EXACT structure, no other text:
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
Provide 3-5 waste reduction tips and 2-3 recipe suggestions using the detected items. Be specific about each food item you see.`;
    }

    // Build the user message with image if provided
    const processedMessages = messages.map((msg: { role: string; content: string }) => {
      if (msg.role === "user" && imageBase64) {
        // Multimodal message with image
        return {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageBase64.startsWith("data:") ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: msg.content,
            },
          ],
        };
      }
      return msg;
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...processedMessages,
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
