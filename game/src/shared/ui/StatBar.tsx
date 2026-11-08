interface StatBarProps {
  label: string;
  value: number;
  tone?: 'green' | 'blue' | 'rose';
}

export function StatBar({ label, value, tone = 'green' }: StatBarProps) {
  return (
    <div className={`stat-bar stat-bar--${tone}`}>
      <div className="stat-bar__heading">
        <span>{label}</span>
        <span><strong>{value}</strong><span className="muted"> / 100</span></span>
      </div>
      <progress aria-label={label} max={100} value={value} />
    </div>
  );
}
