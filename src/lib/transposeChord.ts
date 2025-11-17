/**
 * Motor de Transposição de Acordes
 * Suporta acordes complexos, slash chords e enarmônicos
 */

const chromatic = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Mapa de enarmônicos (bemóis para sustenidos)
const enharmonicMap: { [key: string]: string } = {
  "Db": "C#",
  "Eb": "D#",
  "Gb": "F#",
  "Ab": "G#",
  "Bb": "A#",
};

/**
 * Normaliza um acorde substituindo bemóis por sustenidos equivalentes
 */
function normalizeChord(chord: string): string {
  let normalized = chord;
  Object.keys(enharmonicMap).forEach(flat => {
    normalized = normalized.replace(new RegExp(flat, 'g'), enharmonicMap[flat]);
  });
  return normalized;
}

/**
 * Extrai a nota raiz de um acorde
 */
function getRootNote(chord: string): string | null {
  // Primeiro normaliza o acorde
  const normalized = normalizeChord(chord);
  
  // Tenta encontrar nota com sustenido (2 caracteres)
  const matchSharp = normalized.match(/^([A-G]#)/);
  if (matchSharp) return matchSharp[1];
  
  // Tenta encontrar nota natural (1 caractere)
  const matchNatural = normalized.match(/^([A-G])/);
  if (matchNatural) return matchNatural[1];
  
  return null;
}

/**
 * Extrai o resto do acorde (tudo após a nota raiz)
 */
function getChordSuffix(chord: string, rootNote: string): string {
  return chord.substring(rootNote.length);
}

/**
 * Transpõe uma única nota
 */
function transposeNote(note: string, steps: number): string {
  const normalizedNote = enharmonicMap[note] || note;
  const index = chromatic.indexOf(normalizedNote);
  
  if (index === -1) return note; // Nota não reconhecida
  
  // Calcula novo índice com wrap around
  let newIndex = (index + steps) % chromatic.length;
  if (newIndex < 0) newIndex += chromatic.length;
  
  return chromatic[newIndex];
}

/**
 * Transpõe um acorde complexo
 * Suporta: C, C#, Cm, C7, Cmaj7, C/G, etc.
 */
export function transposeChord(chord: string, steps: number): string {
  if (!chord || steps === 0) return chord;
  
  // Remove espaços extras
  chord = chord.trim();
  
  // Verifica se é um slash chord (ex: C/G, D/F#)
  const slashMatch = chord.match(/^(.+)\/(.+)$/);
  if (slashMatch) {
    const [, mainChord, bassNote] = slashMatch;
    const transposedMain = transposeChord(mainChord, steps);
    const transposedBass = transposeChord(bassNote, steps);
    return `${transposedMain}/${transposedBass}`;
  }
  
  // Extrai a nota raiz
  const rootNote = getRootNote(chord);
  if (!rootNote) return chord; // Não é um acorde válido
  
  // Extrai o sufixo (m, 7, maj7, etc.)
  const suffix = getChordSuffix(chord, rootNote);
  
  // Transpõe a nota raiz
  const transposedRoot = transposeNote(rootNote, steps);
  
  return transposedRoot + suffix;
}

/**
 * Transpõe um array de acordes
 */
export function transposeChordArray(chords: string[], steps: number): string[] {
  return chords.map(chord => transposeChord(chord, steps));
}

/**
 * Transpõe uma cifra completa (texto com acordes e letras)
 * Acordes devem estar entre colchetes: [C] [Am] [F] [G]
 */
export function transposeCifraText(cifraText: string, steps: number): string {
  if (!cifraText || steps === 0) return cifraText;
  
  // Encontra todos os acordes entre colchetes e transpõe
  return cifraText.replace(/\[([^\]]+)\]/g, (match, chord) => {
    return `[${transposeChord(chord, steps)}]`;
  });
}

/**
 * Calcula quantos semitons existem entre dois tons
 */
export function getSemitoneDistance(fromKey: string, toKey: string): number {
  const normalizedFrom = enharmonicMap[fromKey] || fromKey;
  const normalizedTo = enharmonicMap[toKey] || toKey;
  
  const fromIndex = chromatic.indexOf(normalizedFrom);
  const toIndex = chromatic.indexOf(normalizedTo);
  
  if (fromIndex === -1 || toIndex === -1) return 0;
  
  let distance = toIndex - fromIndex;
  
  // Escolhe o caminho mais curto (pode ir para frente ou para trás)
  if (distance > 6) distance -= 12;
  if (distance < -6) distance += 12;
  
  return distance;
}

/**
 * Lista todos os tons disponíveis
 */
export function getAllKeys(): string[] {
  return [...chromatic];
}
