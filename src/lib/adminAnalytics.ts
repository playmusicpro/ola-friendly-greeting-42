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

export type ActivityRow = { user_id: string; last_active_at: string };

export function summarizeEngagement(userIds: string[], activity: ActivityRow[], now = new Date()) {
  const timestamps = new Map(activity.map(row => [row.user_id, Date.parse(row.last_active_at)]));
  const day = 86_400_000;
  let active = 0, inactive = 0, intermediate = 0, unknown = 0;
  for (const id of userIds) {
    const timestamp = timestamps.get(id);
    if (timestamp === undefined || !Number.isFinite(timestamp)) { unknown++; continue; }
    const age = now.getTime() - timestamp;
    if (age <= 7 * day) active++;
    else if (age > 14 * day) inactive++;
    else intermediate++;
  }
  return { active, inactive, intermediate, unknown };
}

export function summarizeMarket(shows: AdminShow[], profiles: AdminProfile[]) {
  const summary = summarizeAdminShows(shows);
  const byUser = new Map(profiles.map(profile => [profile.id, profile]));
  const groups = (key: (profile: AdminProfile | undefined) => string) => {
    const buckets = new Map<string, typeof summary.rows>();
    for (const show of summary.rows) {
      const name = key(byUser.get(show.user_id));
      const rows = buckets.get(name) ?? [];
      rows.push(show);
      buckets.set(name, rows);
    }
    return [...buckets].map(([name, rows]) => ({
      name, shows: rows.length,
      averageCost: rows.reduce((sum, row) => sum + row.costs, 0) / rows.length,
      grossTicket: rows.reduce((sum, row) => sum + Number(row.cache), 0) / rows.length,
      netTicket: rows.reduce((sum, row) => sum + row.revenue, 0) / rows.length,
      averageMargin: rows.reduce((sum, row) => sum + row.marginPercent, 0) / rows.length,
    })).sort((a, b) => b.shows - a.shows || a.name.localeCompare(b.name));
  };
  const count = summary.totalShows;
  return {
    count, averageCost: count ? summary.costs / count : 0,
    grossTicket: count ? summary.gross / count : 0,
    netTicket: count ? summary.net / count : 0,
    genres: groups(profile => profile?.genero_musical?.trim() || 'Não informado'),
    cities: groups(profile => profile?.cidade?.trim() ? `${profile.cidade.trim()}${profile.estado ? ` / ${profile.estado}` : ''}` : 'Não informado'),
    regions: groups(profile => profile?.estado?.trim() || 'Não informado'),
  };
}

export function moduleUsagePercentages(rows: { module: string; accesses: number; users_count: number }[]) {
  const total = rows.reduce((sum, row) => sum + Number(row.accesses), 0);
  return rows.map(row => ({ ...row, accesses: Number(row.accesses), percentage: total ? Number(row.accesses) / total * 100 : 0 }));
}