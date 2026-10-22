import { supabase } from '@/integrations/supabase/client';

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export function validateAvatarFile(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.');
  if (file.size > AVATAR_MAX_BYTES) throw new Error('A imagem deve ter até 5 MB.');
  if (file.size === 0) throw new Error('A imagem está vazia.');
}

export async function prepareAvatar(file: File): Promise<Blob> {
  validateAvatarFile(file);
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Não foi possível preparar a imagem.');
    const side = Math.min(bitmap.width, bitmap.height);
    context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 512, 512);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível preparar a imagem.')), 'image/webp', 0.9));
  } finally {
    bitmap.close();
  }
}

export async function resolveAvatar(metadata: Record<string, unknown>): Promise<string | undefined> {
  if (typeof metadata.avatar_path === 'string' && metadata.avatar_path) {
    const { data, error } = await supabase.storage.from('avatars').createSignedUrl(metadata.avatar_path, 3600);
    if (error) throw error;
    return data.signedUrl;
  }
  return typeof metadata.avatar_url === 'string' ? metadata.avatar_url : undefined;
}

export async function saveAvatar(userId: string, image: Blob, previousPath?: string) {
  const bucket = supabase.storage.from('avatars');
  const path = `${userId}/${crypto.randomUUID()}.webp`;
  const { error: uploadError } = await bucket.upload(path, image, { contentType: 'image/webp', upsert: false });
  if (uploadError) throw uploadError;
  try {
    const { data, error } = await bucket.createSignedUrl(path, 3600);
    if (error) throw error;
    const { error: profileError } = await supabase.auth.updateUser({ data: { avatar_path: path, avatar_url: data.signedUrl } });
    if (profileError) throw profileError;
    if (previousPath?.startsWith(`${userId}/`) && previousPath !== path) await bucket.remove([previousPath]);
    return data.signedUrl;
  } catch (error) {
    await bucket.remove([path]);
    throw error;
  }
}