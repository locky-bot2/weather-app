# Weather App — Hourly Forecast Feature

## Overview
Add an hourly forecast view (next 24 hours) to the weather app. Users can toggle between the existing 5-day daily forecast and a detailed hourly breakdown. Essential for "should I bring an umbrella this afternoon?" decisions.

## Architecture

### API: Open-Meteo (existing)
Add `hourly` parameter to existing weather API call:
```
&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,relative_humidity_2m
&forecast_hours=24
```

### Component Structure (additions)
```
App
├── ...existing components...
├── ForecastToggle        — toggle between Daily / Hourly view
├── HourlyForecast        — 24-hour horizontal scroll forecast
```

### New Files
```
src/
├── components/
│   ├── ForecastToggle.tsx    — Daily/Hourly toggle switch
│   └── HourlyForecast.tsx    — 24-hour horizontal scrollable forecast
├── hooks/
│   └── useHourlyForecast.ts  — hourly data hook (or extend useWeather)
├── types/
│   └── weather.ts            — add HourlyData interface
```

### Data Flow
1. User selects city → existing weather fetch + hourly data fetched
2. Default view: Daily forecast (existing)
3. User clicks "Hourly" → ForecastToggle switches view
4. HourlyForecast renders horizontal scrollable timeline
5. Each hour shows: time, weather emoji, temp, precipitation %, wind

### HourlyForecast Component Design
- **Layout:** Horizontal scrollable timeline (swipe on mobile, scroll on desktop)
- **Each hour card:**
  - Time label (e.g. "2 PM", "Now" for current hour)
  - Weather emoji (from existing WMO code mapping)
  - Temperature (large, bold)
  - Precipitation probability (e.g. "💧 40%")
  - Wind speed (e.g. "💨 12 km/h")
- **Highlight current hour** with accent border/glow
- **Temperature trend line** — small sparkline graph above the cards showing temp curve over 24h

### ForecastToggle Component
- Two-state toggle: "5-Day" | "Hourly"
- Pill-style toggle matching glassmorphism theme
- Smooth transition between views

### TypeScript Interfaces
```typescript
interface HourlyData {
  time: string[];           // ISO datetime strings
  temperature_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  weather_code: number[];
  wind_speed_10m: number[];
  relative_humidity_2m: number[];
}
```

## Constraints
- Use frontend-design skill for UI implementation
- Unit tests with ≥80% coverage
- All existing tests must still pass
- Push to `release/hourly-forecast` branch, create PR to `main`
- Glassmorphism style consistent with existing app
- Responsive: horizontal scroll on all viewports
