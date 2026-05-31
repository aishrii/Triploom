# Triploom

Triploom is an AI-powered travel planning prototype. It combines a cinematic planning UI, demo authentication, local fallback itinerary generation, and a backend Gemini-powered itinerary endpoint.

## Features

- Auth-gated application entry
- Natural language trip prompt parsing
- Dynamic itinerary generation
- Backend Gemini itinerary generation through `/api/itinerary`
- Local fallback planner when Gemini is unavailable
- Vibe cards, experience cards, packing assistant, budget signals, and weather-aware planning
- Vercel serverless API support

## Local Setup

1. Copy `.env.example` to `.env`.
2. Add your Gemini key:

```env
GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
AUTH_SECRET=replace_with_a_long_random_secret
DEMO_EMAIL=demo@triploom.ai
DEMO_PASSWORD=Triploom@123
PORT=8000
```

3. Start the local server:

```powershell
npm start
```

4. Open the URL printed in the terminal.

## Demo Login

```text
Email: demo@triploom.ai
Password: Triploom@123
```

## Testing

```powershell
npm test
```

The tests cover the backend itinerary API, input sanitization, Gemini response parsing, missing-key handling, and successful AI plan generation.

## Vercel Deployment

Add these environment variables in Vercel before redeploying:

```text
GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
AUTH_SECRET=replace_with_a_long_random_secret
DEMO_EMAIL=demo@triploom.ai
DEMO_PASSWORD=Triploom@123
```

The Vercel deployment uses `api/itinerary.js` as the serverless function. The local-only server is `local-server.js`.
