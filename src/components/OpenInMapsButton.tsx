import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { recordAppUsage } from '@/lib/appUsage';
import { mapsDirectionsUrl } from '@/lib/musicianReceipt';

export function OpenInMapsButton({ destination, size = 'sm' }: { destination?: string; size?: 'sm' | 'default' }) {
  if (!destination?.trim()) return null;
  return (
    <Button type="button" variant="outline" size={size} className="gap-1.5" onClick={() => { void recordAppUsage('maps', 'action'); window.open(mapsDirectionsUrl(destination), '_blank', 'noopener'); }}>
      <MapPin className="h-4 w-4" />Abrir no Maps
    </Button>
  );
}
