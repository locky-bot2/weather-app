# Weather App — Architecture & Specification

## Overview
A modern, responsive weather application that displays current weather and 5-day forecasts for any city. Clean UI, fast, works on mobile and desktop.

## Architecture

### Tech Stack
- **Frontend:** React + Vite, TypeScript, TailwindCSS
- **API:** Open-Meteo (free, no API key required)
  - Geocoding: `https://geocoding-api.open-meteo.com/v1/search?name={city}`
  - Weather: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`

### Component Structure
```
App
├── SearchBar          — city search with autocomplete via Open-Meteo geocoding
├── CurrentWeather     — temp, feels like, humidity, wind, weather icon
├── ForecastGrid       — 5-day forecast cards (date, icon, high/low)
└── Footer             — credits, last updated time
```

### Data Flow
1. User types city → SearchBar calls Open-Meteo geocoding API
2. User selects city → App fetches current + forecast from Open-Meteo
3. Data stored in React state → components re-render
4. Loading states, error handling for API failures

### Key Features
- City search with autocomplete dropdown
- Current weather display (temp, feels like, humidity, wind speed, weather condition icon)
- 5-day forecast with daily high/low and weather icons
- Responsive layout (mobile-first)
- Loading spinner during API calls
- Error state when city not found or API fails
- Remember last searched city in localStorage

### Weather Code Mapping
Use WMO weather codes (0-99) mapped to emoji/text:
- 0: ☀️ Clear
- 1-3: ⛅ Partly Cloudy
- 45-48: 🌫️ Fog
- 51-67: 🌧️ Rain
- 71-77: 🌨️ Snow
- 80-82: 🌦️ Rain Showers
- 95-99: ⛈️ Thunderstorm

### File Structure
```
weather-app/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── SearchBar.tsx
│   │   ├── CurrentWeather.tsx
│   │   ├── ForecastGrid.tsx
│   │   └── Footer.tsx
│   ├── hooks/
│   │   └── useWeather.ts        — data fetching hook
│   ├── utils/
│   │   ├── api.ts               — API call functions
│   │   └── weatherCodes.ts      — WMO code → emoji/label mapping
│   └── types/
│       └── weather.ts           — TypeScript interfaces
```

### Design Guidelines
- Use the **frontend-design** skill for implementation
- Glassmorphism card style for weather display
- Gradient background that shifts based on weather condition
- Smooth transitions between states
- Mobile: single column, desktop: side-by-side current + forecast
- Dark/light mode support (system preference)

## Constraints
- No backend required — purely client-side
- No API key needed — Open-Meteo is free
- Must build and run with `npm run dev`
- All code in `shared/weather-app/`
