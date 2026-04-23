export interface WeatherInfo {
  emoji: string;
  label: string;
  bgGradient: string;
}

const weatherMap: Record<number, WeatherInfo> = {
  0: { emoji: '☀️', label: 'Clear', bgGradient: 'from-amber-500 via-orange-400 to-rose-400' },
  1: { emoji: '🌤️', label: 'Mainly Clear', bgGradient: 'from-amber-400 via-sky-400 to-blue-400' },
  2: { emoji: '⛅', label: 'Partly Cloudy', bgGradient: 'from-slate-400 via-blue-400 to-sky-500' },
  3: { emoji: '☁️', label: 'Overcast', bgGradient: 'from-slate-500 via-gray-500 to-blue-600' },
  45: { emoji: '🌫️', label: 'Fog', bgGradient: 'from-gray-400 via-slate-400 to-gray-500' },
  48: { emoji: '🌫️', label: 'Depositing Rime Fog', bgGradient: 'from-gray-400 via-slate-400 to-gray-500' },
  51: { emoji: '🌧️', label: 'Light Drizzle', bgGradient: 'from-slate-600 via-blue-600 to-indigo-700' },
  53: { emoji: '🌧️', label: 'Moderate Drizzle', bgGradient: 'from-slate-600 via-blue-600 to-indigo-700' },
  55: { emoji: '🌧️', label: 'Dense Drizzle', bgGradient: 'from-slate-700 via-blue-700 to-indigo-800' },
  56: { emoji: '🌧️', label: 'Freezing Drizzle', bgGradient: 'from-slate-700 via-blue-700 to-indigo-800' },
  57: { emoji: '🌧️', label: 'Dense Freezing Drizzle', bgGradient: 'from-slate-700 via-blue-700 to-indigo-800' },
  61: { emoji: '🌧️', label: 'Slight Rain', bgGradient: 'from-slate-600 via-blue-600 to-indigo-700' },
  63: { emoji: '🌧️', label: 'Moderate Rain', bgGradient: 'from-slate-700 via-blue-700 to-indigo-800' },
  65: { emoji: '🌧️', label: 'Heavy Rain', bgGradient: 'from-slate-800 via-blue-800 to-indigo-900' },
  66: { emoji: '🌧️', label: 'Freezing Rain', bgGradient: 'from-slate-700 via-blue-700 to-indigo-800' },
  67: { emoji: '🌧️', label: 'Heavy Freezing Rain', bgGradient: 'from-slate-800 via-blue-800 to-indigo-900' },
  71: { emoji: '🌨️', label: 'Slight Snow', bgGradient: 'from-sky-200 via-blue-200 to-indigo-300' },
  73: { emoji: '🌨️', label: 'Moderate Snow', bgGradient: 'from-sky-300 via-blue-300 to-indigo-400' },
  75: { emoji: '🌨️', label: 'Heavy Snow', bgGradient: 'from-sky-300 via-blue-300 to-indigo-400' },
  77: { emoji: '🌨️', label: 'Snow Grains', bgGradient: 'from-sky-200 via-blue-200 to-indigo-300' },
  80: { emoji: '🌦️', label: 'Slight Showers', bgGradient: 'from-slate-500 via-blue-500 to-indigo-600' },
  81: { emoji: '🌦️', label: 'Moderate Showers', bgGradient: 'from-slate-600 via-blue-600 to-indigo-700' },
  82: { emoji: '🌦️', label: 'Violent Showers', bgGradient: 'from-slate-700 via-blue-700 to-indigo-800' },
  85: { emoji: '🌨️', label: 'Slight Snow Showers', bgGradient: 'from-sky-200 via-blue-200 to-indigo-300' },
  86: { emoji: '🌨️', label: 'Heavy Snow Showers', bgGradient: 'from-sky-300 via-blue-300 to-indigo-400' },
  95: { emoji: '⛈️', label: 'Thunderstorm', bgGradient: 'from-slate-800 via-purple-800 to-indigo-900' },
  96: { emoji: '⛈️', label: 'Thunderstorm with Hail', bgGradient: 'from-slate-800 via-purple-800 to-indigo-900' },
  99: { emoji: '⛈️', label: 'Thunderstorm with Heavy Hail', bgGradient: 'from-slate-900 via-purple-900 to-indigo-950' },
};

export function getWeatherInfo(code: number): WeatherInfo {
  return weatherMap[code] ?? { emoji: '❓', label: 'Unknown', bgGradient: 'from-slate-600 via-gray-600 to-slate-700' };
}
