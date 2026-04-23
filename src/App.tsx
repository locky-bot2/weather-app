import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import ForecastGrid from './components/ForecastGrid';
import Footer from './components/Footer';
import { useWeather } from './hooks/useWeather';
import { getWeatherInfo } from './utils/weatherCodes';
import type { GeoResult } from './types/weather';

export default function App() {
  const { weather, loading, error, selectedCity, loadWeather } = useWeather();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [bgGradient, setBgGradient] = useState('from-slate-700 via-slate-800 to-indigo-900');

  useEffect(() => {
    const saved = localStorage.getItem('lastCity');
    if (saved) {
      try {
        const city: GeoResult = JSON.parse(saved);
        loadWeather(city);
      } catch { /* ignore */ }
    }
  }, [loadWeather]);

  useEffect(() => {
    if (weather) {
      const info = getWeatherInfo(weather.current.weather_code);
      setBgGradient(info.bgGradient);
      setLastUpdated(new Date());
    }
  }, [weather]);

  const handleSelect = (city: GeoResult) => {
    loadWeather(city);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-1000 ease-out relative overflow-hidden`}>
      {/* Ambient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-10 animate-fadeIn">
          <h1 className="font-serif text-4xl sm:text-5xl text-white/90 italic tracking-tight">
            Atmosphère
          </h1>
          <p className="text-white/30 text-sm font-light tracking-widest uppercase mt-2">Weather, beautifully</p>
        </header>

        <SearchBar onSelect={handleSelect} />

        {/* Content */}
        <div className="mt-8">
          {loading && (
            <div className="flex flex-col items-center gap-4 py-20 animate-fadeIn">
              <div className="w-10 h-10 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
              <p className="text-white/40 font-light tracking-wider text-sm">Fetching weather...</p>
            </div>
          )}

          {error && (
            <div className="glass-card p-8 text-center animate-slideUp">
              <p className="text-white/70 text-lg font-light">{error}</p>
            </div>
          )}

          {!loading && !error && weather && selectedCity && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CurrentWeather current={weather.current} city={selectedCity} />
              <ForecastGrid daily={weather.daily} />
            </div>
          )}

          {!loading && !error && !weather && (
            <div className="text-center py-20 animate-fadeIn">
              <div className="text-6xl mb-4 animate-float">🌍</div>
              <p className="text-white/40 font-light text-lg">Search for a city to begin</p>
              <p className="text-white/20 font-light text-sm mt-2">Your weather, reimagined</p>
            </div>
          )}
        </div>

        <Footer lastUpdated={lastUpdated} />
      </div>
    </div>
  );
}
