interface Props {
  mode: 'daily' | 'hourly';
  onChange: (mode: 'daily' | 'hourly') => void;
}

export default function ForecastToggle({ mode, onChange }: Props) {
  return (
    <div className="glass-card p-1.5 inline-flex gap-1 animate-slideUp" style={{ animationDelay: '0.1s' }}>
      <button
        onClick={() => onChange('daily')}
        className={`px-5 py-2 rounded-2xl text-sm font-light tracking-wider transition-all duration-300 ${
          mode === 'daily'
            ? 'bg-white/15 text-white shadow-lg shadow-white/5'
            : 'text-white/40 hover:text-white/60'
        }`}
        aria-pressed={mode === 'daily'}
      >
        5-Day
      </button>
      <button
        onClick={() => onChange('hourly')}
        className={`px-5 py-2 rounded-2xl text-sm font-light tracking-wider transition-all duration-300 ${
          mode === 'hourly'
            ? 'bg-white/15 text-white shadow-lg shadow-white/5'
            : 'text-white/40 hover:text-white/60'
        }`}
        aria-pressed={mode === 'hourly'}
      >
        Hourly
      </button>
    </div>
  );
}
