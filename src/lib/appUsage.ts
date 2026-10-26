import { supabase } from '@/integrations/supabase/client';

export const moduleLabels: Record<string, string> = {
  agenda: 'Agenda', finance: 'Financeiro / DRE', repertoire: 'Setlists / Cifras',
  prompts: 'Gerador de Prompts', maps: 'Rotas / Maps',
};

export function moduleForPath(path: string) {
  if (path === '/agenda') return 'agenda';
  if (['/financas', '/panorama', '/receitas', '/analises', '/projeto'].includes(path)) return 'finance';
  if (path === '/repertorio' || path.startsWith('/modo-show/')) return 'repertoire';
  if (path === '/desafios') return 'prompts';
  return null;
}

// Telemetry must never block a user action or send user-entered content.
export async function recordAppUsage(module: string | null, kind = 'navigation') {
  try {
    const { error } = await supabase.rpc('record_app_usage', { p_module: module ?? undefined, p_event_kind: kind });
    if (error) console.warn('Não foi possível registrar atividade.');
  } catch {
    console.warn('Não foi possível registrar atividade.');
  }
}