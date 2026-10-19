interface DashboardTrendProps {
  values: number[];
  label: string;
  tone: 'blue' | 'gold';
}

export default function DashboardTrend({ values, label, tone }: DashboardTrendProps) {
  const finite = values.map(value => Number.isFinite(value) ? value : 0);
  const low = Math.min(0, ...finite);
  const high = Math.max(0, ...finite);
  const span = high - low || 1;
  const points = finite.map((value, index) => `${index * 100 / Math.max(1, finite.length - 1)},${32 - (value - low) / span * 26}`).join(' ');
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={label} className={`mt-4 h-10 w-full ${tone === 'blue' ? 'text-primary' : 'text-gold'}`}>
      <line x1="0" y1="37" x2="100" y2="37" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
