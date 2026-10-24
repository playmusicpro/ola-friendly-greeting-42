import { describe, expect, it } from 'vitest';
import { PitchDetector } from 'pitchy';
import { frequencyToNote } from './tuner';

describe('Afinador cromático local', () => {
  it.each([[440, 'A', 4], [82.406889, 'E', 2], [110, 'A', 2], [146.832384, 'D', 3], [195.997718, 'G', 3], [246.941651, 'B', 3], [329.627557, 'E', 4], [277.182631, 'C♯', 4]])('identifica %s Hz como %s%s', (hz, note, octave) => {
    expect(frequencyToNote(hz)).toMatchObject({ note, octave, status: 'tuned' });
  });
  it('classifica frequências abaixo e acima do alvo', () => {
    expect(frequencyToNote(440 * 2 ** (-20 / 1200))?.status).toBe('flat');
    expect(frequencyToNote(440 * 2 ** (20 / 1200))?.status).toBe('sharp');
    expect(frequencyToNote(440)?.cents).toBe(0);
  });
  it.each([0, -1, Infinity, NaN])('ignora frequência inválida %s', value => {
    expect(frequencyToNote(value)).toBeNull();
  });
  it.each([82.406889, 440, 880])('detecta áudio sintetizado em %s Hz sem rede', frequency => {
    const samples = Float32Array.from({ length: 4096 }, (_, i) => 0.3 * Math.sin(2 * Math.PI * frequency * i / 48000));
    const [detected, clarity] = PitchDetector.forFloat32Array(samples.length).findPitch(samples, 48000);
    expect(detected).toBeCloseTo(frequency, 0);
    expect(clarity).toBeGreaterThan(0.9);
  });
  it('não detecta nota no silêncio', () => {
    const detector = PitchDetector.forFloat32Array(4096);
    detector.minVolumeDecibels = -45;
    expect(detector.findPitch(new Float32Array(4096), 48000)).toEqual([0, 0]);
  });
});