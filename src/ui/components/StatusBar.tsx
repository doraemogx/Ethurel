export interface StatusBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

export function StatusBar({ label, value, max, color }: StatusBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className="bar-row">
      <span style={{ width: 44 }}>{label}</span>
      <div className="bar">
        <div className="bar__fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span>{value}/{max}</span>
    </div>
  );
}
