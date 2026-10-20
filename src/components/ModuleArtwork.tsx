import home from '@/assets/module-home.jpg';
import agenda from '@/assets/module-agenda.jpg';
import finance from '@/assets/module-finance.jpg';
import income from '@/assets/module-income.jpg';
import analytics from '@/assets/module-analytics.jpg';
import video from '@/assets/module-video.jpg';
import repertoire from '@/assets/module-repertoire.jpg';
import challenges from '@/assets/module-challenges.jpg';
import community from '@/assets/module-community.jpg';
import settings from '@/assets/module-settings.jpg';
import help from '@/assets/module-help.jpg';
import savings from '@/assets/module-savings.jpg';
import show from '@/assets/dashboard-concert.jpg';

const artwork: Record<string, string> = {
  '/': home, '/agenda': agenda, '/financas': finance,
  '/receitas': income, '/analises': analytics, '/projeto': video,
  '/repertorio': repertoire, '/desafios': challenges,
  '/comunidades': community, '/configuracoes': settings,
  help, savings, show,
};

export default function ModuleArtwork({ module }: { module: string }) {
  const image = artwork[module];
  if (!image) return null;
  return <span className="module-artwork" aria-hidden="true"><img src={image} alt="" loading="lazy" width={480} height={480} /></span>;
}