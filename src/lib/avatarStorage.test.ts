import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ upload: vi.fn(), sign: vi.fn(), remove: vi.fn(), update: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { storage: { from: () => ({ upload: mocks.upload, createSignedUrl: mocks.sign, remove: mocks.remove }) }, auth: { updateUser: mocks.update } } }));
import { resolveAvatar, saveAvatar, validateAvatarFile } from './avatarStorage';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.upload.mockResolvedValue({ error: null });
  mocks.sign.mockResolvedValue({ data: { signedUrl: 'https://example.test/photo' }, error: null });
  mocks.update.mockResolvedValue({ error: null });
  mocks.remove.mockResolvedValue({ error: null });
});
describe('Avatar privado', () => {
  it('salva na pasta do usuário e atualiza a foto do perfil', async () => {
    await saveAvatar('user-123', new Blob(['image']));
    const path = mocks.upload.mock.calls[0][0];
    expect(path).toMatch(/^user-123\/.+\.webp$/);
    expect(mocks.update).toHaveBeenCalledWith({ data: { avatar_path: path, avatar_url: 'https://example.test/photo' } });
  });
  it('renova o link a partir do caminho persistido', async () => {
    expect(await resolveAvatar({ avatar_path: 'user-123/photo.webp', avatar_url: 'expired' })).toBe('https://example.test/photo');
    expect(mocks.sign).toHaveBeenCalledWith('user-123/photo.webp', 3600);
  });
  it('carrega avatar_url de perfis existentes', async () => {
    expect(await resolveAvatar({ avatar_url: 'https://example.test/existing' })).toBe('https://example.test/existing');
    expect(mocks.sign).not.toHaveBeenCalled();
  });
  it('remove o upload quando a atualização do perfil falha', async () => {
    mocks.update.mockResolvedValue({ error: new Error('save failed') });
    await expect(saveAvatar('user-123', new Blob(['image']))).rejects.toThrow('save failed');
    expect(mocks.remove).toHaveBeenCalledWith([mocks.upload.mock.calls[0][0]]);
  });
  it('rejeita arquivo que não é imagem', () => {
    expect(() => validateAvatarFile(new File(['data'], 'notes.txt', { type: 'text/plain' }))).toThrow('Selecione um arquivo de imagem.');
  });
  it('respeita o limite de 5 MB do armazenamento', () => {
    expect(() => validateAvatarFile(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.png', { type: 'image/png' }))).toThrow('até 5 MB');
  });
});