import type { HourlyData } from '../types/weather';
import { getWeatherInfo } from '../utils/weatherCodes';

interface Props {
  hourly: HourlyData;
}

function formatHour(isoStr: string, index: number): string {
  const d = new Date(isoStr);
  if (index === 0) return 'Now';
  return d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
}

export default function HourlyForecast({ hourly }: Props) {
  const now = new Date();

  // Build sparkline SVG path for temperature trend
  const temps = hourly.temperature_2m;
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;
  const svgW = 600;
  const svgH = 50;
  const points = temps.map((t, i) => {
    const x = (i / (temps.length - 1)) * svgW;
    const y = svgH - ((t - minT) / range) * svgH;
    return `${x},${y}`;
  });
  const pathD = `M${points.join(' L')}`;

  return (
    <div className="glass-card p-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-white/40 text-xs uppercase tracking-[0.2em] mb-5 font-light">
        24-Hour Forecast
      </h3>

      {/* Temperature sparkline */}
      <div className="mb-4 overflow-hidden rounded-xl">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-12"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(251,191,36,0.3)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0.05)" />
            </linearGradient>
          </defs>
          <path
            d={`${pathD} L${svgW},${svgH} L0,${svgH} Z`}
            fill="url(#tempGrad)"
          />
          <path
            d={pathD}
            fill="none"
            stroke="rgba(251,191,36,0.6)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Hourly cards - horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {hourly.time.map((time, i) => {
          const isCurrentHour = new Date(time).getHours() === now.getHours();
          const info = getWeatherInfo(hourly.weather_code[i]);
          const precip = hourly.precipitation_probability[i];

          return (
            <div
              key={time}
              className={`flex-shrink-0 w-[72px] flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all duration-300 ${
                isCurrentHour
                  ? 'bg-white/15 border border-white/20 shadow-lg shadow-white/5'
                  : 'hover:bg-white/5'
              }`}
            >
              <span className="text-white/50 text-xs font-light">
                {formatHour(time, i)}
              </span>
              <span className="text-xl">{info.emoji}</span>
              <span className="text-white font-light text-sm">
                {Math.round(hourly.temperature_2m[i])}°
              </span>
              {precip > 0 && (
                <span className="text-blue-300/70 text-[10px] font-light">
                  💧 {precip}%
                </span>
              )}
              <span className="text-white/30 text-[10px] font-light">
                💨 {Math.round(hourly.wind_speed_10m[i])}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
