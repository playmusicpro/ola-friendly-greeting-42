export const COMMUNITY_URL = 'https://chat.whatsapp.com/GiPcr5DgYXy25KjBiyTFIi';
export const HOTMART_MEMBERS_URL = 'https://hotmart.com/pt-br/club/musico-de-sucesso';

export type MarketFocus = 'automatico' | 'precificacao' | 'repertorio' | 'covers' | 'video';
export const MARKET_FOCUS_LABELS: Record<MarketFocus, string> = {
  automatico: 'Meu momento financeiro', precificacao: 'Precificar meu trabalho',
  repertorio: 'Transição e repertório', covers: 'Gravar covers no celular', video: 'Melhorar meus vídeos',
};
export const FREE_MATERIALS = [
  { title: 'Previsibilidade na estrada', message: "Quer viver de música com previsibilidade? Baixe de graça o e-book '10 Erros Que Te Impedem De Viver De Música' direto na nossa Comunidade VIP do WhatsApp!", button: 'Baixar E-book Grátis' },
  { title: 'Vídeo que abre portas', message: "Vídeo ruim mata contratação! Pegue o 'Checklist Definitivo Para Gravar Vídeo Com Celular' na Comunidade e descubra o combo de luz, áudio e gravação.", button: 'Resgatar Checklist Grátis' },
];
export const PAID_MATERIALS = {
  bar: { title: 'Negociação na prática', message: "Sua margem tá apertada? Entenda a mão da economia e como negociar o couvert com o bar sem perder a data com o e-book 'Bar, Barzinho e Boteco'.", button: 'E-book: Bar, Barzinho e Boteco' },
  precificacao: { title: 'Valorize seu tempo', message: "Não pague pra tocar! Aprenda a precificar seu tempo, alinhar postura e quebrar a bolha da mesmice com o e-book 'Músico de Sucesso'.", button: 'E-book: Músico de Sucesso' },
  repertorio: { title: 'Repertório e transição', message: 'Bora lotar a agenda? Monte um repertório matador de 60 músicas e aplique metas SMART pra viver 100% da estrada.', button: 'E-book: Transição Musical Profissional' },
  covers: { title: 'Seu cover, sua produção', message: "Grave covers no BandLab + CapCut com qualidade de estúdio usando o e-book 'Grave Você Mesmo'.", button: 'E-book: Grave Você Mesmo' },
};