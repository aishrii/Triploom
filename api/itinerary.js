function sendJson(response, status, body) {
  response.status(status).json(body);
}

function buildGeminiPrompt(trip) {
  return `You are Triploom, an AI travel planning engine. Generate a practical, real-time-feeling itinerary as strict JSON only.

Trip brief:
- Destination: ${trip.destination}
- Days: ${trip.days}
- Budget in INR: ${trip.budget}
- Style: ${trip.style}
- Pace: ${trip.paceLabel}
- Weather: ${trip.weather}
- Vibes: ${trip.vibes.join(", ")}
- Mood: ${trip.mood || "open exploration"}

Return only valid JSON with this exact shape:
{
  "summary": "short trip summary",
  "budgetTip": "one budget optimization insight",
  "weatherTip": "one weather-aware planning insight",
  "recommendations": [
    { "title": "experience name", "reason": "why it matches" }
  ],
  "packing": ["item"],
  "days": [
    {
      "label": "Day 1",
      "theme": "theme for the day",
      "items": [
        {
          "time": "09:00",
          "title": "activity title",
          "detail": "specific place or activity, with fallback if needed",
          "vibe": "matching vibe",
          "cost": 2500,
          "crowd": "low crowd"
        }
      ]
    }
  ]
}

Rules:
- Create exactly ${trip.days} days.
- Use 2 to 4 items per day depending on pace.
- Costs must be numeric INR estimates and should fit the overall budget.
- Include local, specific-sounding experiences.
- Include at least one weather-aware fallback.
- Do not include markdown, comments, or text outside JSON.`;
}

function extractGeminiText(data) {
  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n").trim() || "";
}

function parsePlanJson(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Gemini did not return JSON.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

function sanitizeTrip(input) {
  const trip = input && typeof input === "object" ? input : {};
  const days = Math.max(1, Math.min(14, Number(trip.days) || 1));
  const budget = Math.max(5000, Number(trip.budget) || 5000);
  const pace = Math.max(1, Math.min(3, Number(trip.pace) || 2));

  return {
    destination: String(trip.destination || "Goa").slice(0, 80),
    days,
    budget,
    style: String(trip.style || "balanced").slice(0, 40),
    pace,
    paceLabel: { 1: "slow", 2: "balanced", 3: "full" }[pace] || "balanced",
    mood: String(trip.mood || "").slice(0, 500),
    weather: String(trip.weather || "clear").slice(0, 40),
    vibes: Array.isArray(trip.vibes) && trip.vibes.length
      ? trip.vibes.map((vibe) => String(vibe).slice(0, 40)).slice(0, 6)
      : ["hidden gems"]
  };
}

module.exports = async function itineraryHandler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  try {
    const trip = sanitizeTrip(request.body?.trip);
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    if (!apiKey) {
      sendJson(response, 503, {
        error: "GEMINI_API_KEY is missing in Vercel Environment Variables."
      });
      return;
    }

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: buildGeminiPrompt(trip) }]
        }],
        generationConfig: {
          temperature: 0.75,
          responseMimeType: "application/json"
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      sendJson(response, geminiResponse.status, {
        error: `Gemini error ${geminiResponse.status}: ${errorText.slice(0, 240)}`
      });
      return;
    }

    const data = await geminiResponse.json();
    const plan = parsePlanJson(extractGeminiText(data));
    sendJson(response, 200, { source: "gemini", model, plan });
  } catch (error) {
    sendJson(response, 500, {
      error: error.message || "Unable to generate itinerary."
    });
  }
};
