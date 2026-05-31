const { requestGeminiPlan, sanitizeTrip } = require("./itinerary-core");

function sendJson(response, status, body) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.status(status).json(body);
}

const requestLog = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

function rateLimitKey(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    request.headers["x-real-ip"] ||
    "anonymous";
}

function isRateLimited(request) {
  const now = Date.now();
  const key = rateLimitKey(request);
  const record = requestLog.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (record.resetAt <= now) {
    requestLog.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  record.count += 1;
  requestLog.set(key, record);
  return record.count > RATE_LIMIT_MAX;
}

async function itineraryHandler(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  if (isRateLimited(request)) {
    sendJson(response, 429, { error: "Too many itinerary requests. Please wait a minute and try again." });
    return;
  }

  try {
    const result = await requestGeminiPlan(sanitizeTrip(request.body?.trip), {
      missingKeyMessage: "GEMINI_API_KEY is missing in Vercel Environment Variables."
    });
    sendJson(response, 200, result);
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      error: error.message || "Unable to generate itinerary."
    });
  }
}

module.exports = itineraryHandler;
