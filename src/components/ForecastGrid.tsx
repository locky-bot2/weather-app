import type { DailyForecast } from '../types/weather';
import { getWeatherInfo } from '../utils/weatherCodes';

interface Props {
  daily: DailyForecast;
}

export default function ForecastGrid({ daily }: Props) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '0.15s' }}>
      <h3 className="text-white/40 text-xs uppercase tracking-[0.2em] mb-5 font-light">5-Day Forecast</h3>
      <div className="space-y-2">
        {daily.time.map((date, i) => {
          const d = new Date(date + 'T00:00:00');
          const dayLabel = i === 0 ? 'Today' : dayNames[d.getDay()];
          const info = getWeatherInfo(daily.weather_code[i]);
          const range = daily.temperature_2m_max[i] - daily.temperature_2m_min[i];
          const maxRange = 20;
          const barWidth = Math.max(20, (range / maxRange) * 100);

          return (
            <div key={date} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0 group hover:bg-white/5 -mx-3 px-3 rounded-xl transition-colors">
              <span className="text-white/60 font-light w-12 text-sm">{dayLabel}</span>
              <span className="text-xl w-8 text-center">{info.emoji}</span>
              <span className="text-white/40 font-light w-10 text-right text-sm">{Math.round(daily.temperature_2m_min[i])}°</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400/60 to-amber-400/80 transition-all duration-700"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-white font-light w-10 text-sm">{Math.round(daily.temperature_2m_max[i])}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
