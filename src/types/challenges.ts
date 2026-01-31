export interface PresskitData {
  // Informações básicas
  nomeArtistico: string;
  generoMusical: string;
  cidade: string;
  estado: string;
  
  // Bio e história
  bioResumida: string; // até 100 palavras
  historia: string; // história completa
  
  // Carreira
  anosCarreira: number;
  principaisConquistas: string[];
  showsRealizados?: number;
  
  // Estilo e influências
  estiloMusical: string;
  influencias: string[];
  diferenciais: string[];
  
  // Redes sociais
  instagram?: string;
  youtube?: string;
  spotify?: string;
  tiktok?: string;
  facebook?: string;
  site?: string;
  
  // Contato
  emailContato: string;
  telefoneContato?: string;
  
  // Fotos (URLs)
  fotoPrincipal?: string;
  fotosAdicionais?: string[];
}

export interface FlyerData {
  // Informações do evento
  nomeArtista: string;
  nomeEvento?: string;
  data: string;
  horario: string;
  local: string;
  endereco?: string;
  
  // Estilo visual
  estiloVisual: 'moderno' | 'minimalista' | 'vintage' | 'neon' | 'elegante';
  corPrincipal?: string;
  corSecundaria?: string;
  
  // Informações adicionais
  valorIngresso?: string;
  informacoesExtras?: string;
  redesSociais?: string;
  
  // Formato
  formato: 'instagram-feed' | 'instagram-story' | 'facebook' | 'whatsapp';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'presskit' | 'flyer' | 'repertorio' | 'shows' | 'financeiro';
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'presskit' | 'flyer';
  completed: boolean;
  completedAt?: string;
  badgeId: string;
}

export interface AIGeneratedContent {
  id: string;
  type: 'presskit-bio' | 'presskit-release' | 'presskit-captions' | 'flyer-prompt';
  content: string;
  createdAt: string;
  sourceData: PresskitData | FlyerData;
}

// Templates de prompts para geração de conteúdo
export const PRESSKIT_PROMPTS = {
  bioProfissional: (data: PresskitData) => `Crie uma bio profissional de artista musical para ${data.nomeArtistico}.

Informações:
- Nome artístico: ${data.nomeArtistico}
- Gênero musical: ${data.generoMusical}
- Cidade/Estado: ${data.cidade}, ${data.estado}
- Anos de carreira: ${data.anosCarreira}
- Principais conquistas: ${data.principaisConquistas.join(', ')}
- Estilo musical: ${data.estiloMusical}
- Influências: ${data.influencias.join(', ')}
- Diferenciais: ${data.diferenciais.join(', ')}
${data.showsRealizados ? `- Shows realizados: ${data.showsRealizados}` : ''}

Crie 3 versões:
1. CURTA (50 palavras) - Para redes sociais
2. MÉDIA (100 palavras) - Para plataformas de streaming
3. LONGA (200 palavras) - Para press release

Mantenha tom profissional, objetivo e inspirador. Use terceira pessoa.`,

  pressRelease: (data: PresskitData, lancamento: { titulo: string; tipo: string; data: string; descricao: string }) => `Escreva um press release profissional para ${data.nomeArtistico}.

Sobre o artista:
- Nome: ${data.nomeArtistico}
- Gênero: ${data.generoMusical}
- Bio: ${data.bioResumida}

Sobre o lançamento:
- Título: ${lancamento.titulo}
- Tipo: ${lancamento.tipo}
- Data de lançamento: ${lancamento.data}
- Descrição: ${lancamento.descricao}

Redes sociais:
${data.instagram ? `- Instagram: ${data.instagram}` : ''}
${data.spotify ? `- Spotify: ${data.spotify}` : ''}
${data.youtube ? `- YouTube: ${data.youtube}` : ''}

Contato para imprensa: ${data.emailContato}

Escreva um press release completo com:
1. Título chamativo
2. Lead forte com as informações principais
3. Contexto sobre o artista
4. Detalhes do lançamento
5. Citação do artista (crie uma citação inspiradora)
6. Informações de contato`,

  legendasRedes: (data: PresskitData) => `Crie legendas para redes sociais de ${data.nomeArtistico}.

Informações:
- Nome: ${data.nomeArtistico}
- Gênero: ${data.generoMusical}
- Estilo: ${data.estiloMusical}
- Diferenciais: ${data.diferenciais.join(', ')}

Redes:
${data.instagram ? `Instagram: ${data.instagram}` : ''}

Crie legendas para:
1. POST DE APRESENTAÇÃO - Primeiro contato com novos seguidores
2. POST DE SHOW - Anunciando próxima apresentação
3. POST DE BASTIDORES - Compartilhando processo criativo
4. POST DE LANÇAMENTO - Divulgando nova música

Cada legenda deve ter:
- Texto principal envolvente
- Emojis relevantes
- Hashtags otimizadas (5-10)
- Call to action`,

  riderTecnico: (data: PresskitData, formacao: { instrumentos: string[]; necessidades: string[] }) => `Crie um rider técnico profissional para ${data.nomeArtistico}.

Formação:
${formacao.instrumentos.map(i => `- ${i}`).join('\n')}

Necessidades técnicas informadas:
${formacao.necessidades.map(n => `- ${n}`).join('\n')}

Gênero musical: ${data.generoMusical}

Crie um rider técnico completo dividido em:
1. LINE UP - Lista de músicos e instrumentos
2. BACKLINE - Equipamentos necessários no palco
3. PA (SISTEMA DE SOM) - Requisitos de sonorização
4. ILUMINAÇÃO - Necessidades básicas de luz
5. CAMARIM - Requisitos de backstage
6. OBSERVAÇÕES - Considerações especiais

Formato profissional e objetivo.`
};

export const FLYER_PROMPTS = {
  moderno: (data: FlyerData) => `Create a modern music event poster with these specifications:

Event: ${data.nomeEvento || `${data.nomeArtista} Live`}
Artist: ${data.nomeArtista}
Date: ${data.data}
Time: ${data.horario}
Venue: ${data.local}
${data.endereco ? `Address: ${data.endereco}` : ''}
${data.valorIngresso ? `Tickets: ${data.valorIngresso}` : ''}

Style: Modern, clean, bold typography
Color palette: ${data.corPrincipal || 'Dark background with vibrant accent colors'}
Elements: Geometric shapes, dynamic composition, gradient effects
Typography: Bold sans-serif for headline, clean readable for details
Mood: Energetic, contemporary, professional

Aspect ratio: ${data.formato === 'instagram-story' ? '9:16' : '1:1'}
Quality: High resolution, print-ready

--ar ${data.formato === 'instagram-story' ? '9:16' : '1:1'} --v 6 --style raw`,

  minimalista: (data: FlyerData) => `Create a minimalist elegant music event poster:

Event: ${data.nomeEvento || `${data.nomeArtista} Live`}
Artist: ${data.nomeArtista}
Date: ${data.data}
Time: ${data.horario}
Venue: ${data.local}

Style: Minimalist, sophisticated, lots of white space
Colors: Black, white, and ${data.corPrincipal || 'one accent color'}
Layout: Clean, centered, breathing room
Typography: Elegant modern fonts, refined spacing
Elements: Simple lines, subtle textures

Aspect ratio: ${data.formato === 'instagram-story' ? '9:16' : '1:1'}

--ar ${data.formato === 'instagram-story' ? '9:16' : '1:1'} --v 6 --style raw`,

  vintage: (data: FlyerData) => `Create a vintage/retro music event poster:

Event: ${data.nomeEvento || `${data.nomeArtista} Live`}
Artist: ${data.nomeArtista}
Date: ${data.data}
Time: ${data.horario}
Venue: ${data.local}

Style: Retro, vintage, nostalgic
Era: 70s/80s aesthetic
Colors: Warm tones, ${data.corPrincipal || 'earth colors, muted palette'}
Elements: Vintage textures, retro typography, classic design motifs
Typography: Display fonts from the era

Aspect ratio: ${data.formato === 'instagram-story' ? '9:16' : '1:1'}

--ar ${data.formato === 'instagram-story' ? '9:16' : '1:1'} --v 6 --style raw`,

  neon: (data: FlyerData) => `Create a neon-style music event poster:

Event: ${data.nomeEvento || `${data.nomeArtista} Live`}
Artist: ${data.nomeArtista}
Date: ${data.data}
Time: ${data.horario}
Venue: ${data.local}

Style: Neon, cyberpunk, glowing
Colors: Dark background with ${data.corPrincipal || 'vibrant neon pink, blue, purple'}
Elements: Neon light effects, glow, reflections, urban aesthetic
Typography: Neon sign style, glowing text effects
Mood: Night life, electric, vibrant

Aspect ratio: ${data.formato === 'instagram-story' ? '9:16' : '1:1'}

--ar ${data.formato === 'instagram-story' ? '9:16' : '1:1'} --v 6 --style raw`,

  elegante: (data: FlyerData) => `Create an elegant luxury music event poster:

Event: ${data.nomeEvento || `${data.nomeArtista} Live`}
Artist: ${data.nomeArtista}
Date: ${data.data}
Time: ${data.horario}
Venue: ${data.local}

Style: Elegant, luxurious, sophisticated
Colors: ${data.corPrincipal || 'Black and gold, or deep jewel tones'}
Elements: Gold foil effects, subtle patterns, premium feel
Typography: Elegant serif or refined sans-serif
Mood: Upscale, exclusive, refined

Aspect ratio: ${data.formato === 'instagram-story' ? '9:16' : '1:1'}

--ar ${data.formato === 'instagram-story' ? '9:16' : '1:1'} --v 6 --style raw`
};
