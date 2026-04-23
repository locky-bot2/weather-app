interface Props {
  lastUpdated: Date | null;
}

export default function Footer({ lastUpdated }: Props) {
  return (
    <footer className="text-center mt-8 mb-4 animate-fadeIn">
      <p className="text-white/25 text-xs font-light tracking-wider">
        Powered by Open-Meteo
        {lastUpdated && (
          <span> · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </p>
    </footer>
  );
}
