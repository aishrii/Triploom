const form = document.querySelector("#tripForm");
const destinationInput = document.querySelector("#destination");
const daysInput = document.querySelector("#days");
const budgetInput = document.querySelector("#budget");
const styleInput = document.querySelector("#style");
const paceInput = document.querySelector("#pace");
const moodInput = document.querySelector("#mood");
const weatherInput = document.querySelector("#weather");
const vibesContainer = document.querySelector("#vibes");
const itineraryEl = document.querySelector("#itinerary");
const recommendationsEl = document.querySelector("#recommendations");
const packingListEl = document.querySelector("#packingList");
const toastEl = document.querySelector("#toast");
const workspace = document.querySelector(".workspace");
const plannerResults = document.querySelector("#plannerResults");
const chatLog = document.querySelector("#chatLog");
const chatInput = document.querySelector("#chatInput");
const chatBtn = document.querySelector("#chatBtn");
const heroPrompt = document.querySelector("#heroPrompt");
const heroGenerate = document.querySelector("#heroGenerate");
const heroVoiceBtn = document.querySelector("#heroVoiceBtn");
const chatVoiceBtn = document.querySelector("#chatVoiceBtn");
const vibeCards = document.querySelectorAll("[data-vibe-card]");
const navLinks = document.querySelectorAll(".nav-link");
const generateButton = document.querySelector("#generateButton");
const generationStatus = document.querySelector("#generationStatus");

const activityBank = {
  "hidden gems": [
    ["Old quarter walk", "Follow side streets, small chapels, indie stores, and family-run bakeries."],
    ["Backstreet cafe crawl", "Taste two local cafes and ask the owner for their favorite nearby stop."],
    ["Neighborhood viewpoint", "End the day at a quiet lookout instead of the busiest landmark."]
  ],
  "food exploration": [
    ["Market breakfast trail", "Start with local snacks, fruit stalls, and a short spice or produce walk."],
    ["Regional lunch table", "Book a compact tasting menu built around coastal and seasonal dishes."],
    ["Dessert and coffee lane", "Close with a sweet stop and a relaxed neighborhood coffee bar."]
  ],
  adventure: [
    ["Guided nature route", "Pick a half-day hike, bike loop, kayak paddle, or cliffside trail."],
    ["Water or trail session", "Reserve the most weather-safe active slot before the afternoon heat."],
    ["Sunset challenge stop", "Add a short climb, beach run, or viewpoint walk before dinner."]
  ],
  romantic: [
    ["Slow brunch reservation", "Choose a pretty table, low travel friction, and room for lingering."],
    ["Golden hour promenade", "Plan a calm walk with a photo stop and a nearby dessert option."],
    ["Candlelit local dinner", "Book an intimate spot with regional dishes and easy transit back."]
  ],
  relaxation: [
    ["Late-start wellness block", "Keep the morning soft with a spa, pool, garden, or beach chair window."],
    ["Scenic reading break", "Protect one quiet hour at a cafe, garden, or waterfront bench."],
    ["Unscheduled sunset", "Leave the final hour open so the day does not feel overpacked."]
  ],
  nightlife: [
    ["Live music scout", "Find a venue with local artists and a backup bar within a short walk."],
    ["Night market loop", "Combine street food, small shops, and safe ride-hailing pickup points."],
    ["Late lounge finish", "End at a relaxed lounge rather than stacking too many venues."]
  ]
};

const weatherAdvice = {
  clear: ["Clear skies", "Outdoor experiences stay in the morning and sunset windows."],
  rain: ["Rain-aware", "Outdoor blocks move earlier while museums, cafes, and markets become backups."],
  hot: ["Heat adjusted", "Midday switches to indoor food, rest, or shaded cultural stops."],
  windy: ["Wind checked", "Water activities get backup routes and viewpoint stops stay flexible."]
};

const packingBase = ["Comfortable walking shoes", "Reusable water bottle", "Day bag", "ID and booking copies"];
const packingByWeather = {
  clear: ["Sunscreen", "Sunglasses", "Light outer layer"],
  rain: ["Compact umbrella", "Quick-dry layer", "Waterproof phone pouch"],
  hot: ["Breathable clothes", "Electrolytes", "Hat"],
  windy: ["Windbreaker", "Hair ties or cap", "Secure sling bag"]
};

let selectedVibes = ["hidden gems"];
let surpriseMode = false;
let currentTrip = null;
let generatedPlan = null;
let aiBusy = false;
let hasGeneratedItinerary = false;
let activeRecognition = null;

const destinationHints = [
  "Bali",
  "Goa",
  "Greece",
  "Tokyo",
  "Iceland",
  "Kyoto",
  "Cappadocia",
  "Maldives",
  "Santorini",
  "Rishikesh",
  "Ubud",
  "Vik",
  "Vík"
];

function money(value) {
  const rounded = Math.round(value);
  if (rounded >= 10000 && rounded % 1000 === 0) {
    return `₹${Math.round(rounded / 1000)}k`;
  }
  return `₹${rounded.toLocaleString("en-IN")}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}

function paceLabel(value) {
  return { 1: "slow", 2: "balanced", 3: "full" }[value] || "balanced";
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function showPlannerResults() {
  hasGeneratedItinerary = true;
  plannerResults.hidden = false;
}

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function stopActiveRecognition() {
  if (activeRecognition) {
    activeRecognition.stop();
    activeRecognition = null;
  }
  heroVoiceBtn.classList.remove("listening");
  chatVoiceBtn.classList.remove("listening");
}

function startVoiceInput(targetInput, triggerButton, onComplete) {
  const SpeechRecognition = getSpeechRecognition();
  if (!SpeechRecognition) {
    showToast("Voice input is not supported in this browser.");
    generationStatus.textContent = "Voice input is not supported in this browser.";
    return;
  }

  stopActiveRecognition();

  const recognition = new SpeechRecognition();
  activeRecognition = recognition;
  recognition.lang = "en-IN";
  recognition.interimResults = true;
  recognition.continuous = false;

  triggerButton.classList.add("listening");
  triggerButton.setAttribute("aria-pressed", "true");
  generationStatus.textContent = "Listening for voice input.";
  showToast("Listening...");

  let finalTranscript = "";

  recognition.addEventListener("result", (event) => {
    let interimTranscript = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0].transcript;
      if (event.results[index].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    targetInput.value = `${finalTranscript}${interimTranscript}`.trim();
  });

  recognition.addEventListener("end", () => {
    triggerButton.classList.remove("listening");
    triggerButton.setAttribute("aria-pressed", "false");
    activeRecognition = null;

    if (targetInput.value.trim()) {
      generationStatus.textContent = "Voice input captured.";
      onComplete();
    } else {
      generationStatus.textContent = "No voice input captured.";
      showToast("No voice input captured.");
    }
  });

  recognition.addEventListener("error", () => {
    triggerButton.classList.remove("listening");
    triggerButton.setAttribute("aria-pressed", "false");
    activeRecognition = null;
    generationStatus.textContent = "Voice input failed.";
    showToast("Voice input failed. Try typing instead.");
  });

  recognition.start();
}

function saveTripState() {
  const trip = readTrip();
  localStorage.setItem("triploomState", JSON.stringify({
    ...trip,
    surpriseMode
  }));
}

function restoreTripState() {
  try {
    const saved = JSON.parse(localStorage.getItem("triploomState") || "null");
    if (!saved) return;
    destinationInput.value = saved.destination || destinationInput.value;
    daysInput.value = saved.days || daysInput.value;
    budgetInput.value = saved.budget || budgetInput.value;
    styleInput.value = saved.style || styleInput.value;
    paceInput.value = saved.pace || paceInput.value;
    moodInput.value = saved.mood || moodInput.value;
    weatherInput.value = saved.weather || weatherInput.value;
    selectedVibes = Array.isArray(saved.vibes) && saved.vibes.length ? saved.vibes : selectedVibes;
    surpriseMode = Boolean(saved.surpriseMode);
    workspace.classList.toggle("surprise", surpriseMode);
  } catch {
    localStorage.removeItem("triploomState");
  }
}

function syncVibeControls() {
  vibesContainer.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", selectedVibes.includes(chip.dataset.vibe));
  });
  vibeCards.forEach((card) => {
    card.classList.toggle("active", selectedVibes.includes(card.dataset.vibeCard));
  });
}

function readTrip() {
  return {
    destination: destinationInput.value.trim() || "Your destination",
    days: Math.max(1, Math.min(14, Number(daysInput.value) || 1)),
    budget: Math.max(5000, Number(budgetInput.value) || 5000),
    style: styleInput.value,
    pace: Number(paceInput.value),
    mood: moodInput.value.trim(),
    weather: weatherInput.value,
    vibes: [...selectedVibes]
  };
}

function activityFor(vibes, day, slot) {
  const vibe = vibes[(day + slot) % vibes.length] || "hidden gems";
  const options = activityBank[vibe] || activityBank["hidden gems"];
  const item = options[(day + slot) % options.length];
  return { vibe, title: item[0], detail: item[1] };
}

function inferDestination(text) {
  const lower = text.toLowerCase();
  return destinationHints.find((destination) => lower.includes(destination.toLowerCase()));
}

function inferVibes(text) {
  const lower = text.toLowerCase();
  const matches = Object.keys(activityBank).filter((vibe) => {
    const compact = vibe.replace(" exploration", "");
    return lower.includes(vibe) ||
      lower.includes(compact) ||
      (vibe === "food exploration" && /(foodie|food trail|caf|cafe|café|ramen|market)/.test(lower)) ||
      (vibe === "hidden gems" && /(hidden|offbeat|local|quiet|secret)/.test(lower)) ||
      (vibe === "relaxation" && /(wellness|calm|restore|spa|slow)/.test(lower)) ||
      (vibe === "nightlife" && /(night|bar|jazz|club|music)/.test(lower));
  });
  return [...new Set(matches)];
}

function applyTextToPlanner(request) {
  const lower = request.toLowerCase();
  const changed = [];
  const destination = inferDestination(request);
  const dayMatch = lower.match(/(\d+)\s*(?:day|days)/);
  const budgetMatch = lower.match(/(?:under|below|budget|for)\s*(?:₹|rs\.?|inr|\$)?\s*(\d+)\s*(k)?/);
  const vibeWords = inferVibes(request);

  if (destination) {
    destinationInput.value = destination === "Vik" ? "Vík" : destination;
    changed.push(destinationInput.value);
  }

  if (dayMatch) {
    daysInput.value = Math.max(1, Math.min(14, Number(dayMatch[1])));
    changed.push(`${daysInput.value} days`);
  }

  if (budgetMatch) {
    const parsedBudget = Number(budgetMatch[1]) * (budgetMatch[2] ? 1000 : 1);
    budgetInput.value = Math.max(5000, parsedBudget);
    changed.push(`${money(Number(budgetInput.value))} budget`);
  }

  if (lower.includes("rain")) {
    weatherInput.value = "rain";
    changed.push("rain-aware planning");
  } else if (lower.includes("winter") || lower.includes("cold") || lower.includes("wind")) {
    weatherInput.value = "windy";
    changed.push("weather backup routes");
  } else if (lower.includes("hot")) {
    weatherInput.value = "hot";
    changed.push("heat-aware planning");
  } else if (lower.includes("clear") || lower.includes("sun")) {
    weatherInput.value = "clear";
    changed.push("clear-weather routing");
  }

  if (vibeWords.length) {
    selectedVibes = vibeWords;
    changed.push(`${selectedVibes.join(", ")} vibe`);
  }

  if (lower.includes("slow") || lower.includes("quiet") || lower.includes("calm")) {
    paceInput.value = "1";
    changed.push("slower pace");
  } else if (lower.includes("packed") || lower.includes("full")) {
    paceInput.value = "3";
    changed.push("full pace");
  }

  if (/couple|romantic|honeymoon/.test(lower)) {
    styleInput.value = "couple";
  } else if (/solo|alone/.test(lower)) {
    styleInput.value = "solo";
  } else if (/family|kids/.test(lower)) {
    styleInput.value = "family";
  } else if (/group|friends|crew/.test(lower)) {
    styleInput.value = "group";
  }

  moodInput.value = request;
  syncVibeControls();
  renderTrip(readTrip());
  return changed.length ? changed : ["mood inspiration"];
}

function buildItinerary(trip, skipped = false) {
  const slots = trip.pace === 1 ? 2 : trip.pace === 2 ? 3 : 4;
  const times = ["09:00", "12:30", "16:30", "20:00"];
  const dailyBudget = trip.budget / trip.days;

  return Array.from({ length: trip.days }, (_, dayIndex) => {
    const items = Array.from({ length: slots }, (_, slotIndex) => {
      const activity = activityFor(trip.vibes, dayIndex, slotIndex + (skipped ? 1 : 0));
      const rainyIndoor = trip.weather === "rain" && slotIndex > 0;
      const hotIndoor = trip.weather === "hot" && slotIndex === 1;
      const adjustedTitle = rainyIndoor || hotIndoor ? `${activity.title} backup` : activity.title;
      const baseCost = dailyBudget / slots;
      const cost = baseCost * (0.72 + ((dayIndex + slotIndex) % 3) * 0.12);

      return {
        time: times[slotIndex],
        title: adjustedTitle,
        detail: activity.detail,
        vibe: activity.vibe,
        cost,
        crowd: slotIndex === 1 ? "moderate crowd" : "low crowd"
      };
    });

    return {
      label: `Day ${dayIndex + 1}`,
      theme: `${trip.vibes[dayIndex % trip.vibes.length]} route`,
      items
    };
  });
}

function budgetState(trip, itinerary) {
  const total = itinerary
    .flatMap((day) => day.items)
    .reduce((sum, item) => sum + item.cost, 0);
  const ratio = total / trip.budget;

  if (ratio > 0.92) {
    return ["Tight", "Swap one dinner for a market meal and cluster transit to protect the trip quality.", total];
  }

  if (ratio < 0.68) {
    return ["Room to upgrade", "Add one guided experience or a better-located stay without breaking the budget.", total];
  }

  return ["On track", "Local stays and walkable clusters keep costs controlled.", total];
}

function normalizeGeneratedPlan(plan, trip) {
  if (!plan || !Array.isArray(plan.days)) return null;

  return {
    summary: String(plan.summary || `AI-generated ${trip.destination} itinerary.`),
    budgetTip: String(plan.budgetTip || "Gemini balanced the trip against your stated budget."),
    weatherTip: String(plan.weatherTip || "The plan includes weather-aware alternates."),
    safetyNote: String(plan.safetyNote || "Verify opening hours, local rules, weather, and transit before booking."),
    assumptions: Array.isArray(plan.assumptions) ? plan.assumptions.slice(0, 4).map(String) : [],
    recommendations: Array.isArray(plan.recommendations) ? plan.recommendations.slice(0, 5) : [],
    packing: Array.isArray(plan.packing) ? plan.packing.slice(0, 8) : [],
    days: plan.days.slice(0, trip.days).map((day, dayIndex) => ({
      label: String(day.label || `Day ${dayIndex + 1}`),
      theme: String(day.theme || `${trip.vibes[dayIndex % trip.vibes.length]} route`),
      items: Array.isArray(day.items) ? day.items.slice(0, 4).map((item, itemIndex) => ({
        time: String(item.time || ["09:00", "12:30", "16:30", "20:00"][itemIndex] || "10:00"),
        title: String(item.title || "AI planned experience"),
        detail: String(item.detail || item.reason || "Generated from your Triploom brief."),
        vibe: String(item.vibe || trip.vibes[itemIndex % trip.vibes.length]),
        cost: Number(item.cost) || Math.round(trip.budget / trip.days / 3),
        crowd: String(item.crowd || "low crowd")
      })) : []
    })).filter((day) => day.items.length)
  };
}

async function generateBackendPlan(trip) {
  if (aiBusy) {
    showToast("AI is already generating a plan.");
    return false;
  }

  aiBusy = true;
  generatedPlan = null;
  form.classList.add("is-loading");
  form.setAttribute("aria-busy", "true");
  generateButton.disabled = true;
  generationStatus.textContent = "Generating itinerary with AI.";
  showToast("AI is building your itinerary...");

  try {
    const response = await fetch("/api/itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ trip })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Planner API error ${response.status}`);
    }

    const data = await response.json();
    const plan = normalizeGeneratedPlan(data.plan, trip);
    if (!plan) throw new Error("Gemini response was missing itinerary days.");

    generatedPlan = plan;
    renderTrip(trip);
    generationStatus.textContent = "AI itinerary generated.";
    showToast(data.source === "gemini" ? "Gemini itinerary generated." : "Local itinerary generated.");
    return true;
  } catch (error) {
    generatedPlan = null;
    renderTrip(trip);
    generationStatus.textContent = "AI itinerary failed. Local itinerary is active.";
    showToast(`${error.message} Local planner is active.`);
    return false;
  } finally {
    aiBusy = false;
    form.classList.remove("is-loading");
    form.removeAttribute("aria-busy");
    generateButton.disabled = false;
  }
}

function renderLiveSession(trip, itinerary, weatherStatus) {
  const firstDay = itinerary[0];
  if (!firstDay) return;

  const userMessage = document.querySelector(".user-message");
  const aiMessage = document.querySelector(".ai-message");
  const miniTitle = document.querySelector(".mini-itinerary .panel-head h3");
  const miniMeta = document.querySelector(".mini-itinerary .panel-head p");
  const miniBadge = document.querySelector(".mini-itinerary .panel-head span");
  const miniRows = document.querySelectorAll(".mini-row");

  userMessage.textContent = `${trip.destination}, ${trip.days} ${trip.days === 1 ? "day" : "days"}, ${trip.vibes.join(" + ")}. ${trip.mood || "Build a trip around my travel mood."}`;
  aiMessage.textContent = `Building a ${paceLabel(trip.pace)} ${trip.destination} loop with ${firstDay.items.length} daily moments. ${weatherStatus} signals are baked into the schedule and the budget is tracking at ${money(trip.budget)}.`;
  miniMeta.textContent = `${firstDay.label.toUpperCase()} · ${trip.destination.toUpperCase()}`;
  miniTitle.textContent = firstDay.theme.replace(/\b\w/g, (letter) => letter.toUpperCase());
  miniBadge.textContent = `✓ ${weatherStatus}`;

  miniRows.forEach((row, index) => {
    const item = firstDay.items[index] || firstDay.items[firstDay.items.length - 1];
    row.querySelector("time").textContent = item.time;
    row.querySelector("span").textContent = item.title;
    row.querySelector("em").textContent = index === 0 ? "Quiet window" : item.crowd;
  });
}

function renderTrip(trip, skipped = false) {
  const aiPlan = !skipped ? generatedPlan : null;
  const itinerary = aiPlan ? aiPlan.days : buildItinerary(trip, skipped);
  const [budgetStatus, budgetTip, estimate] = budgetState(trip, itinerary);
  const [weatherStatus, weatherTip] = weatherAdvice[trip.weather];
  currentTrip = { ...trip, itinerary, estimate };

  document.querySelector("#tripTitle").textContent = `${trip.destination}, ${trip.days} ${trip.days === 1 ? "day" : "days"}`;
  document.querySelector("#vibeSummary").textContent = `${trip.vibes.join(", ")} with ${paceLabel(trip.pace)} pacing`;
  document.querySelector("#budgetSummary").textContent = `${money(trip.budget)} planned`;
  document.querySelector("#budgetStatus").textContent = budgetStatus;
  document.querySelector("#budgetTip").textContent = aiPlan?.budgetTip || budgetTip;
  document.querySelector("#weatherStatus").textContent = weatherStatus;
  document.querySelector("#weatherTip").textContent = aiPlan
    ? `${aiPlan.weatherTip} ${aiPlan.safetyNote}`
    : weatherTip;
  document.querySelector("#twinStatus").textContent = trip.vibes.length > 2 ? "Confident" : "Learning";
  document.querySelector("#twinTip").textContent = `Preference memory favors ${trip.vibes[0]} and ${trip.style.replace("-", " ")} planning.`;

  itineraryEl.innerHTML = itinerary.map((day) => `
    <article class="timeline-day">
      <div class="day-head">
        <strong>${escapeHTML(day.label)}</strong>
        <span>${escapeHTML(day.theme)}</span>
      </div>
      ${day.items.map((item) => `
        <div class="timeline-item">
          <time>${escapeHTML(item.time)}</time>
          <div>
            <h3>${escapeHTML(item.title)}</h3>
            <p>${escapeHTML(item.detail)} Reason: matches ${escapeHTML(item.vibe)} and ${paceLabel(trip.pace)} pacing.</p>
          </div>
          <span class="cost-pill">${money(item.cost)}</span>
        </div>
      `).join("")}
    </article>
  `).join("");

  const aiRecommendations = aiPlan?.recommendations || [];
  if (aiRecommendations.length) {
    recommendationsEl.innerHTML = aiRecommendations.map((pick) => `
      <article class="recommendation">
        <strong>${escapeHTML(pick.title || "AI pick")}</strong>
        <p>${escapeHTML(pick.reason || "Selected by Gemini for this trip.")}</p>
      </article>
    `).join("");
  } else {
    const uniqueVibes = [...new Set(trip.vibes)];
    recommendationsEl.innerHTML = uniqueVibes.map((vibe, index) => {
    const pick = activityBank[vibe][index % activityBank[vibe].length];
    const mood = escapeHTML(trip.mood || "open exploration");
    return `
      <article class="recommendation">
        <strong>${escapeHTML(pick[0])}</strong>
        <p>${pick[1]} Recommended because it fits ${vibe} and your mood: ${mood}.</p>
      </article>
    `;
    }).join("");
  }

  const packItems = aiPlan?.packing?.length ? aiPlan.packing : [...packingBase, ...packingByWeather[trip.weather]];
  packingListEl.innerHTML = packItems.map((item) => `
    <li><input type="checkbox" aria-label="${escapeHTML(item)}"><span>${escapeHTML(item)}</span></li>
  `).join("");

  document.querySelector("#shareDestination").textContent = trip.destination;
  document.querySelector("#shareText").textContent = `${trip.days} ${trip.days === 1 ? "day" : "days"} of ${trip.vibes.join(", ")} shaped by ${trip.mood || "your travel mood"}.`;
  document.querySelector("#shareTags").innerHTML = [
    paceLabel(trip.pace),
    trip.style.replace("-", " "),
    weatherStatus.toLowerCase(),
    money(estimate)
  ].map((tag) => `<span>${tag}</span>`).join("");
  renderLiveSession(trip, itinerary, weatherStatus);
  saveTripState();
}

vibesContainer.addEventListener("click", (event) => {
  const button = event.target.closest(".chip");
  if (!button) return;

  const vibe = button.dataset.vibe;
  button.classList.toggle("active");
  selectedVibes = [...vibesContainer.querySelectorAll(".chip.active")].map((chip) => chip.dataset.vibe);

  if (selectedVibes.length === 0) {
    selectedVibes = [vibe];
    button.classList.add("active");
  }

  syncVibeControls();
  renderTrip(readTrip());
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const trip = readTrip();
  showPlannerResults();
  generateBackendPlan(trip);
});

document.querySelector("#replanBtn").addEventListener("click", () => {
  showPlannerResults();
  generatedPlan = null;
  renderTrip(readTrip(), true);
  showToast("Skipped item replaced with a nearby fallback.");
});

document.querySelector("#escapeBtn").addEventListener("click", () => {
  destinationInput.value = "Nearby escape";
  daysInput.value = "2";
  budgetInput.value = "25000";
  paceInput.value = "1";
  moodInput.value = "low stress, scenic, easy to book";
  weatherInput.value = "clear";
  selectedVibes = ["relaxation", "hidden gems"];
  syncVibeControls();
  generatedPlan = null;
  showPlannerResults();
  renderTrip(readTrip());
  showToast("One-click escape mode built a slower getaway.");
});

document.querySelector("#surpriseBtn").addEventListener("click", () => {
  surpriseMode = !surpriseMode;
  workspace.classList.toggle("surprise", surpriseMode);
  showToast(surpriseMode ? "Surprise mode hides trip details." : "Surprise mode is off.");
});

document.querySelector("#copyBtn").addEventListener("click", async () => {
  if (!currentTrip) renderTrip(readTrip());
  const text = `Triploom: ${currentTrip.destination}, ${currentTrip.days} days. Vibes: ${currentTrip.vibes.join(", ")}. Budget estimate: ${money(currentTrip.estimate)}.`;

  try {
    await navigator.clipboard.writeText(text);
    showToast("Share card copied.");
  } catch {
    showToast(text);
  }
});

function addChatLine(speaker, text) {
  const line = document.createElement("p");
  const label = document.createElement("strong");
  label.textContent = speaker;
  line.append(label, ` ${text}`);
  chatLog.append(line);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function applyChatRequest() {
  const sourceInput = this === heroGenerate ? heroPrompt : chatInput;
  const request = sourceInput.value.trim();
  if (!request) return;

  const lower = request.toLowerCase();
  addChatLine("You", request);
  const changed = applyTextToPlanner(request);
  addChatLine("Triploom", `Updated ${changed.join(", ")}.`);
  showPlannerResults();
  generateBackendPlan(readTrip());
  if (sourceInput === chatInput) chatInput.value = "";
  if (sourceInput === heroPrompt) document.querySelector("#planner").scrollIntoView({ behavior: "smooth", block: "start" });
}

chatBtn.addEventListener("click", applyChatRequest);
heroGenerate.addEventListener("click", applyChatRequest);
heroVoiceBtn.addEventListener("click", () => {
  startVoiceInput(heroPrompt, heroVoiceBtn, () => applyChatRequest.call(heroGenerate));
});
chatVoiceBtn.addEventListener("click", () => {
  startVoiceInput(chatInput, chatVoiceBtn, () => applyChatRequest.call(chatBtn));
});
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") applyChatRequest();
});
heroPrompt.addEventListener("keydown", (event) => {
  if (event.key === "Enter") applyChatRequest.call(heroGenerate);
});

document.querySelectorAll(".quick-prompts button").forEach((button) => {
  button.addEventListener("click", () => {
    heroPrompt.value = button.dataset.prompt;
    applyChatRequest.call(heroGenerate);
    document.querySelector("#planner").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const navObserver = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${visible.target.id}`;
    link.classList.toggle("active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}, { rootMargin: "-35% 0px -50% 0px", threshold: [0.1, 0.3, 0.6] });

["planner", "vibe-engine", "features"].forEach((id) => {
  const section = document.getElementById(id);
  if (section) navObserver.observe(section);
});

vibeCards.forEach((card) => {
  const applyCard = () => {
    selectedVibes = [card.dataset.vibeCard];
    destinationInput.value = card.dataset.destination || destinationInput.value;
    if (card.dataset.style) styleInput.value = card.dataset.style;
    moodInput.value = `${card.querySelector("h3").textContent.toLowerCase()} trip with ${card.querySelector("p").textContent.toLowerCase()}`;
    syncVibeControls();
    generatedPlan = null;
    showPlannerResults();
    renderTrip(readTrip());
    document.querySelector("#planner").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`${card.querySelector("h3").textContent} vibe applied.`);
  };
  card.addEventListener("click", applyCard);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      applyCard();
    }
  });
});

["input", "change"].forEach((eventName) => {
  [destinationInput, daysInput, budgetInput, styleInput, paceInput, moodInput, weatherInput].forEach((control) => {
    control.addEventListener(eventName, () => {
      generatedPlan = null;
      renderTrip(readTrip());
    });
  });
});

restoreTripState();
syncVibeControls();
renderTrip(readTrip());
plannerResults.hidden = !hasGeneratedItinerary;
