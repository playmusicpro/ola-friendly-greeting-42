import type { Database } from '@/integrations/supabase/types';

export type AdminProfile = Database['public']['Tables']['profiles']['Row'];
export type AdminShow = Database['public']['Tables']['shows']['Row'];

export function summarizeAdminShows(shows: AdminShow[]) {
  const completed = shows.filter(show => show.realizado);
  const monthly = new Map<string, { month: string; shows: number; revenue: number }>();
  let revenue = 0;
  let costs = 0;
  const rows = completed.map(show => {
    const cost = Number(show.combustivel) + Number(show.pedagio) + Number(show.roupas)
      + Number(show.equipamentos) + Number(show.consumacao)
      + Number(show.pagamento_musicos) + Number(show.outros_custos);
    const gross = Number(show.cache);
    const net = gross - cost;
    revenue += gross;
    costs += cost;
    const month = show.date.slice(0, 7);
    const bucket = monthly.get(month) ?? { month, shows: 0, revenue: 0 };
    bucket.shows += 1;
    bucket.revenue += net;
    monthly.set(month, bucket);
    return { ...show, costs: cost, revenue: net, marginPercent: gross > 0 ? net / gross * 100 : 0 };
  });
  return {
    rows, totalShows: completed.length, gross: revenue, costs, net: revenue - costs,
    margin: revenue > 0 ? (revenue - costs) / revenue * 100 : 0,
    monthly: [...monthly.values()].sort((a, b) => a.month.localeCompare(b.month)),
  };
}