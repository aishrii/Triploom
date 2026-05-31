# Triploom Feature Roadmap

Triploom is a travel planning and experience engine that helps users turn intent, mood, constraints, and live conditions into adaptive trip plans.

## Product Pillars

### 1. AI Planning Core

- AI Dynamic Itinerary Builder: Generate day-by-day plans from destination, budget, duration, interests, travel style, and pace.
- Conversational Travel Planner: Let users build and revise trips through natural language instead of only forms and filters.
- Travel Vibe Engine: Support vibes such as adventure, romantic, luxury, backpacking, food exploration, nightlife, hidden gems, and relaxation.
- Mood-to-Itinerary Generation: Create itineraries from moods, aesthetics, playlists, Pinterest boards, or social inspiration.
- One-Click Escape Mode: Generate spontaneous getaway plans from mood, budget, location, and available vacation days.

### 2. Adaptive Trip Intelligence

- Real-Time Adaptive Replanning: Adjust plans based on weather, traffic, closures, delays, or skipped activities.
- Weather-Aware Planning: Prioritize indoor or outdoor activities using live forecast conditions.
- Smart Transit Routing: Optimize routes across flights, trains, metro, walking, and cabs by cost, time, and convenience.
- Live Crowd Heatmaps: Show attraction crowd levels, ideal visit times, and nearby alternatives.
- Local Event Injection: Add concerts, exhibitions, cultural events, sports matches, and nightlife into active itineraries.

### 3. Personalization And Discovery

- AI Experience Recommendations: Suggest hidden gems, local experiences, seasonal attractions, cafes, festivals, and offbeat activities.
- Travel Twin AI: Learn user preferences over time and personalize future recommendations automatically.
- Surprise Mode: Hide selected itinerary details until travel day for playful exploration.
- AI Packing Assistant: Generate packing lists based on weather, activities, culture, and duration.

### 4. Budget And Group Planning

- Smart Budget Optimizer: Track estimated costs and suggest better-value alternatives while preserving trip quality.
- Group Trip Consensus AI: Gather traveler preferences and optimize plans across interests and budgets.
- Collaborative Planning Workspace: Support shared editing, comments, and AI suggestions for group planning.

### 5. Sharing, Community, And Memories

- Shareable AI Travel Cards: Generate aesthetic itinerary snapshots and social summary cards.
- Creator And Community Itineraries: Let travelers publish reusable guides that others can remix.
- Travel Memory Timeline: Convert completed trips into interactive timelines with photos, maps, places, and stories.

## Suggested MVP

1. AI Dynamic Itinerary Builder
2. Travel Vibe Engine
3. Conversational Travel Planner
4. Smart Budget Optimizer
5. AI Experience Recommendations
6. Weather-Aware Planning
7. AI Packing Assistant
8. Shareable AI Travel Cards

This MVP gives Triploom a complete planning loop: create a plan, personalize it, estimate cost, adapt to basic real-world conditions, and share the result.

## Future Differentiators

- Real-time adaptive replanning with closures, traffic, weather, and crowds.
- Travel Twin AI for long-term personalization.
- Group consensus planning for shared trips.
- Creator marketplace for itinerary discovery and remixing.
- Memory timeline for post-trip retention and storytelling.

## Data And Integrations To Consider

- Places and attractions data
- Maps, transit, and routing APIs
- Weather forecasts
- Local events and ticketing feeds
- Crowd or popularity signals
- Flight, train, hotel, and cab providers
- User preference and trip history storage
- Image generation or design export for travel cards

## Implementation Notes

- Start with explicit user preferences before building inferred personalization.
- Keep itinerary items structured: place, time window, cost estimate, duration, location, category, tags, and fallback options.
- Store user constraints separately from generated recommendations so plans can be regenerated safely.
- Make every AI recommendation explainable with short reasons such as "matches food exploration vibe" or "lower cost alternative nearby".
- Treat live replanning as a later layer over the itinerary model, not a separate planning system.
