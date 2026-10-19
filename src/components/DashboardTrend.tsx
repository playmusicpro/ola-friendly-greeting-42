import { useId } from 'react';

interface DashboardTrendProps {
  values: number[];
  label: string;
  tone: 'blue' | 'gold';
}

export default function DashboardTrend({ values, label, tone }: DashboardTrendProps) {
  const gradientId = useId().replace(/:/g, '');
  const finite = values.map(value => Number.isFinite(value) ? value : 0);
  const low = Math.min(0, ...finite);
  const high = Math.max(0, ...finite);
  const span = high - low || 1;
  const points = finite.map((value, index) => `${index * 100 / Math.max(1, finite.length - 1)},${32 - (value - low) / span * 26}`).join(' ');
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={label} className={`dashboard-sparkline mt-4 h-10 w-full ${tone === 'blue' ? 'dashboard-trend-blue' : 'dashboard-trend-gold'}`}>
      <defs><linearGradient id={gradientId}><stop offset="0%" className="dashboard-trend-start" /><stop offset="100%" className="dashboard-trend-end" /></linearGradient></defs>
      <line x1="0" y1="37" x2="100" y2="37" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" />
      <polyline points={points} fill="none" stroke={`url(#${gradientId})`} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
