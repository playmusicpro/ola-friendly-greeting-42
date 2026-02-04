// Centralized help content and tooltips in PT-BR

export const tooltips = {
  // Dashboard / Financial Cards
  dashboard: {
    totalShows: "Total de shows realizados neste mês. Clique para ver detalhes na Agenda.",
    totalRevenue: "Receita bruta somando todos os cachês recebidos no período.",
    averageCache: "Média de cachê por show, calculada automaticamente.",
    monthlyProjection: "Projeção de receita baseada nos shows já confirmados.",
    dre: "Demonstrativo de Resultado do Exercício - visão resumida das suas finanças.",
  },
  
  // Repertoire / Setlist
  repertoire: {
    addSong: "Adicione uma nova música ao seu repertório com tom, duração e letra.",
    transpose: "Mude o tom da música. Use as setas ou digite o tom desejado.",
    createSetlist: "Crie um setlist personalizado para seu próximo show.",
    showMode: "Modo Show: visualização otimizada para apresentações ao vivo.",
    reorderSongs: "Arraste para reordenar as músicas no setlist.",
  },
  
  // Financial
  financial: {
    addExpense: "Registre uma despesa (equipamentos, transporte, etc).",
    addIncome: "Registre uma receita extra além dos cachês.",
    savingsGoal: "Cofrinho: defina metas de economia para equipamentos ou projetos.",
    exportPdf: "Exporte seu relatório financeiro em PDF.",
  },
  
  // Export
  export: {
    sharePdf: "Compartilhe o PDF via WhatsApp, e-mail ou outras redes.",
    downloadPdf: "Baixe o arquivo PDF para seu dispositivo.",
    printPdf: "Imprima diretamente do navegador.",
  },
  
  // Challenges
  challenges: {
    presskit: "Gere um presskit profissional usando IA para divulgar seu trabalho.",
    flyer: "Crie flyers atrativos para seus shows usando prompts de IA.",
  },
};

export const faqItems = [
  {
    id: 'transpose',
    question: "Como transpor uma música?",
    answer: `Para transpor uma música:
1. Acesse o Repertório e selecione a música desejada.
2. Clique no botão de transposição (🎹) ao lado do tom atual.
3. Use as setas ▲ ou ▼ para subir ou descer meio tom.
4. O tom será salvo automaticamente.

Dica: Você pode transpor rapidamente no Modo Show usando os atalhos de teclado.`,
  },
  {
    id: 'cofrinho',
    question: "Como criar um cofrinho?",
    answer: `O Cofrinho é uma meta de economia para um objetivo específico:
1. Acesse o Consultor Financeiro.
2. Clique em "Novo Cofrinho" ou no botão "+".
3. Defina o nome (ex: "Pedaleira Nova"), valor total e prazo.
4. Registre depósitos conforme for economizando.

O sistema calculará automaticamente quanto você precisa guardar por mês.`,
  },
  {
    id: 'add-show',
    question: "Como adicionar um show?",
    answer: `Para adicionar um show:
1. Acesse a Agenda e clique em "Novo Show".
2. Preencha: data, local, cachê e tipo de evento.
3. Opcionalmente, vincule um setlist existente.
4. Salve e o show aparecerá no calendário e Dashboard.

Os shows confirmados alimentam automaticamente seus relatórios financeiros.`,
  },
  {
    id: 'create-setlist',
    question: "Como criar um setlist?",
    answer: `Para criar um setlist:
1. Acesse o Repertório e clique em "Novo Setlist".
2. Dê um nome (ex: "Casamento João & Maria").
3. Adicione músicas do seu repertório arrastando ou clicando.
4. Reordene conforme a sequência do show.

No Modo Show, navegue pelas músicas com swipe ou setas do teclado.`,
  },
  {
    id: 'export-pdf',
    question: "Como exportar relatórios em PDF?",
    answer: `Para exportar em PDF:
1. Acesse a seção desejada (Finanças, Setlist, Presskit).
2. Clique no ícone de exportação (📄) ou "Exportar PDF".
3. Escolha o formato e período (se aplicável).
4. O arquivo será gerado e baixado automaticamente.

Você também pode compartilhar diretamente via WhatsApp.`,
  },
  {
    id: 'modo-show',
    question: "Como usar o Modo Show?",
    answer: `O Modo Show é otimizado para apresentações ao vivo:
1. Acesse um setlist e clique em "Modo Show".
2. Use tela cheia para melhor visualização.
3. Navegue: setas do teclado, swipe ou botões.
4. Ajuste o tamanho da fonte nas configurações.

Dica: O Modo Show funciona offline após o primeiro carregamento!`,
  },
  {
    id: 'communities',
    question: "Como acessar as Comunidades?",
    answer: `As Comunidades do Play Pro oferecem conteúdo exclusivo:
1. Acesse o menu "Comunidades".
2. Escolha entre Hotmart (conteúdo estratégico) ou Kiwify (cursos).
3. Clique para ser redirecionado à plataforma.

Lá você encontra materiais, networking e formação contínua para músicos.`,
  },
];

export const onboardingSteps = {
  welcome: {
    title: "Bem-vindo ao Play Pro",
    subtitle: "O app que transforma músicos em profissionais de sucesso",
    description: "Gerencie shows, finanças, repertório e muito mais em um só lugar.",
  },
  activity: {
    title: "Qual é a sua principal atividade?",
    subtitle: "Isso nos ajuda a personalizar sua experiência",
    options: [
      { id: 'cantor', label: 'Cantor(a) Solo', icon: '🎤', description: 'Trabalho principalmente sozinho(a)' },
      { id: 'banda', label: 'Banda / Grupo', icon: '🎸', description: 'Faço parte de uma banda ou grupo' },
      { id: 'professor', label: 'Professor(a)', icon: '🎹', description: 'Dou aulas de música' },
    ],
  },
  import: {
    title: "Importar dados (opcional)",
    subtitle: "Comece com seus dados existentes",
    description: "Você pode pular esta etapa e adicionar seus shows e músicas manualmente depois.",
  },
  tour: {
    title: "Conheça seu Dashboard",
    subtitle: "Uma visão geral das suas métricas",
    items: [
      { label: "Shows do Mês", description: "Total de apresentações realizadas" },
      { label: "Receita Total", description: "Soma dos cachês recebidos" },
      { label: "Média por Show", description: "Seu cachê médio calculado" },
      { label: "Próximos Shows", description: "Agenda das próximas apresentações" },
    ],
  },
};
