import type { CurrentWeatherData, GeoResult } from '../types/weather';
import { getWeatherInfo } from '../utils/weatherCodes';

interface Props {
  current: CurrentWeatherData;
  city: GeoResult;
}

export default function CurrentWeather({ current, city }: Props) {
  const info = getWeatherInfo(current.weather_code);

  return (
    <div className="glass-card p-8 flex flex-col items-center text-center animate-slideUp">
      <div className="text-7xl mb-3 drop-shadow-lg animate-float">{info.emoji}</div>
      <h2 className="font-serif text-2xl text-white/90 italic mb-1">{city.name}</h2>
      <p className="text-white/40 text-sm font-light tracking-wide">{city.admin1 ? `${city.admin1}, ` : ''}{city.country}</p>
      <div className="my-6">
        <span className="text-8xl font-extralight text-white tracking-tighter">
          {Math.round(current.temperature_2m)}
        </span>
        <span className="text-3xl text-white/50 font-extralight align-top">°C</span>
      </div>
      <p className="text-white/70 font-light text-lg mb-6">{info.label}</p>
      <div className="grid grid-cols-3 gap-6 w-full pt-6 border-t border-white/10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-white/40 text-xs uppercase tracking-widest">Feels Like</span>
          <span className="text-white font-light text-lg">{Math.round(current.apparent_temperature)}°</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-white/40 text-xs uppercase tracking-widest">Humidity</span>
          <span className="text-white font-light text-lg">{current.relative_humidity_2m}%</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-white/40 text-xs uppercase tracking-widest">Wind</span>
          <span className="text-white font-light text-lg">{Math.round(current.wind_speed_10m)} km/h</span>
        </div>
      </div>
    </div>
  );
}
