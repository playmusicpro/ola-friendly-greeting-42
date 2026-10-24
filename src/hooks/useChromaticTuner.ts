import { useCallback, useEffect, useRef, useState } from 'react';
import { PitchDetector } from 'pitchy';
import { frequencyToNote, type TunerReading } from '@/lib/tuner';

type AudioResources = {
  context?: AudioContext;
  stream?: MediaStream;
  source?: MediaStreamAudioSourceNode;
  analyser?: AnalyserNode;
  frame?: number;
};

export function useChromaticTuner() {
  const [status, setStatus] = useState<'off' | 'starting' | 'listening'>('off');
  const [reading, setReading] = useState<TunerReading | null>(null);
  const [error, setError] = useState('');
  const resources = useRef<AudioResources>({});
  const generation = useRef(0);

  const release = useCallback(() => {
    generation.current += 1;
    const current = resources.current;
    resources.current = {};
    if (current.frame !== undefined) cancelAnimationFrame(current.frame);
    current.stream?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    current.source?.disconnect();
    current.analyser?.disconnect();
    if (current.context && current.context.state !== 'closed') void current.context.close().catch(() => {});
  }, []);

  const stop = useCallback(() => {
    release();
    setStatus('off');
    setReading(null);
  }, [release]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', stop);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', stop);
      release();
    };
  }, [release, stop]);

  const start = useCallback(async () => {
    release();
    const token = generation.current;
    setReading(null);
    setError('');
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
      setStatus('off');
      setError('Microfone indisponível. Abra o aplicativo em HTTPS em um navegador compatível.');
      return;
    }
    setStatus('starting');
    try {
      const context = new AudioContext();
      resources.current.context = context;
      // Resume during the user gesture, before waiting for the permission dialog.
      const resumed = context.resume();
      void resumed.catch(() => {});
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 },
        video: false,
      });
      if (token !== generation.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      resources.current.stream = stream;
      await resumed;
      if (token !== generation.current) return;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser); // Never connect the microphone to the speakers.
      Object.assign(resources.current, { source, analyser });
      stream.getTracks().forEach(track => { track.onended = stop; });
      const samples = new Float32Array(analyser.fftSize);
      const detector = PitchDetector.forFloat32Array(samples.length);
      detector.minVolumeDecibels = -45;
      let lastFrame = -Infinity;
      let lastPitchAt = -Infinity;
      setStatus('listening');
      const tick = (time: number) => {
        if (token !== generation.current) return;
        if (time - lastFrame >= 80) {
          lastFrame = time;
          analyser.getFloatTimeDomainData(samples);
          const [frequency, clarity] = detector.findPitch(samples, context.sampleRate);
          if (clarity >= 0.9 && frequency >= 25 && frequency <= 4000) {
            lastPitchAt = time;
            setReading(frequencyToNote(frequency));
          } else if (time - lastPitchAt > 500) {
            setReading(null);
          }
        }
        resources.current.frame = requestAnimationFrame(tick);
      };
      resources.current.frame = requestAnimationFrame(tick);
    } catch (cause) {
      if (token !== generation.current) return;
      stop();
      const name = cause instanceof Error ? cause.name : '';
      setError(name === 'NotAllowedError' || name === 'SecurityError'
        ? 'Permissão do microfone negada. Permita o acesso nas configurações do navegador e tente novamente.'
        : name === 'NotFoundError'
          ? 'Nenhum microfone encontrado neste dispositivo.'
          : name === 'NotReadableError'
            ? 'O microfone está indisponível ou em uso por outro aplicativo.'
            : 'Não foi possível ligar o microfone. Tente novamente.');
    }
  }, [release, stop]);

  return { status, reading, error, start, stop };
}