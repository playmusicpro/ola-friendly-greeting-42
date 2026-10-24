import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useChromaticTuner } from './useChromaticTuner';

function setup() {
  const track = { stop: vi.fn(), onended: null };
  const stream = { getTracks: () => [track] } as unknown as MediaStream;
  const close = vi.fn().mockResolvedValue(undefined);
  const disconnect = vi.fn();
  const getUserMedia = vi.fn().mockResolvedValue(stream);
  class FakeContext {
    state = 'running';
    sampleRate = 48000;
    resume = vi.fn().mockResolvedValue(undefined);
    close = close;
    createMediaStreamSource = () => ({ connect: vi.fn(), disconnect });
    createAnalyser = () => ({ fftSize: 4096, getFloatTimeDomainData: vi.fn(), disconnect });
  }
  vi.stubGlobal('AudioContext', FakeContext);
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
  vi.stubGlobal('requestAnimationFrame', vi.fn().mockReturnValue(7));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  return { track, stream, close, getUserMedia, disconnect };
}

afterEach(() => { vi.unstubAllGlobals(); });
describe('Controle do microfone', () => {
  it('só solicita permissão ao ligar e libera recursos ao desligar', async () => {
    const mocks = setup();
    const { result } = renderHook(useChromaticTuner);
    expect(mocks.getUserMedia).not.toHaveBeenCalled();
    await act(() => result.current.start());
    expect(result.current.status).toBe('listening');
    expect(mocks.getUserMedia).toHaveBeenCalledWith({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 }, video: false });
    act(() => result.current.stop());
    expect(mocks.track.stop).toHaveBeenCalledOnce();
    expect(mocks.close).toHaveBeenCalledOnce();
    expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
    expect(result.current.status).toBe('off');
  });
  it('encerra o microfone ao desmontar o módulo', async () => {
    const mocks = setup();
    const { result, unmount } = renderHook(useChromaticTuner);
    await act(() => result.current.start());
    unmount();
    expect(mocks.track.stop).toHaveBeenCalledOnce();
    expect(mocks.close).toHaveBeenCalledOnce();
  });
  it('libera uma permissão que chega depois de fechar o módulo', async () => {
    const mocks = setup();
    let resolve: ((stream: MediaStream) => void) | undefined;
    mocks.getUserMedia.mockReturnValue(new Promise<MediaStream>(done => { resolve = done; }));
    const { result, unmount } = renderHook(useChromaticTuner);
    act(() => { void result.current.start(); });
    unmount();
    resolve?.(mocks.stream);
    await waitFor(() => expect(mocks.track.stop).toHaveBeenCalledOnce());
  });
  it('mostra erro recuperável quando a permissão é negada', async () => {
    const mocks = setup();
    mocks.getUserMedia.mockRejectedValue(new DOMException('denied', 'NotAllowedError'));
    const { result } = renderHook(useChromaticTuner);
    await act(() => result.current.start());
    expect(result.current.status).toBe('off');
    expect(result.current.error).toContain('Permissão do microfone negada');
    expect(mocks.close).toHaveBeenCalledOnce();
  });
});