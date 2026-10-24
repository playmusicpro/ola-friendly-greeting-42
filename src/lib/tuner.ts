export const TUNING_TOLERANCE_CENTS = 5;
const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

export function frequencyToNote(frequency: number) {
  if (!Number.isFinite(frequency) || frequency <= 0) return null;
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const targetFrequency = 440 * 2 ** ((midi - 69) / 12);
  const cents = 1200 * Math.log2(frequency / targetFrequency);
  return {
    note: NOTES[((midi % 12) + 12) % 12],
    octave: Math.floor(midi / 12) - 1,
    frequency,
    targetFrequency,
    cents,
    status: Math.abs(cents) <= TUNING_TOLERANCE_CENTS ? 'tuned' : cents < 0 ? 'flat' : 'sharp',
  };
}

export type TunerReading = NonNullable<ReturnType<typeof frequencyToNote>>;