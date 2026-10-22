import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { prepareAvatar, resolveAvatar, saveAvatar } from '@/lib/avatarStorage';

export default function ProfileAvatar({ name }: { name: string }) {
  const { session } = useAuth();
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const busy = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState<{ userId: string; url?: string }>();
  const userId = session?.user.id;
  const avatarPath = session?.user.user_metadata.avatar_path;
  const avatarUrl = session?.user.user_metadata.avatar_url;

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const refresh = async () => {
      try {
        const url = await resolveAvatar({ avatar_path: avatarPath, avatar_url: avatarUrl });
        if (active) setPhoto({ userId, url });
      } catch {
        if (active) setPhoto({ userId });
      }
    };
    void refresh();
    const interval = window.setInterval(() => void refresh(), 45 * 60 * 1000);
    return () => { active = false; window.clearInterval(interval); };
  }, [userId, avatarPath, avatarUrl]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !userId || busy.current) return;
    busy.current = true;
    setUploading(true);
    try {
      const image = await prepareAvatar(file);
      const url = await saveAvatar(userId, image, typeof avatarPath === 'string' ? avatarPath : undefined);
      setPhoto({ userId, url });
      toast({ title: 'Foto de perfil atualizada!' });
    } catch (error) {
      toast({ title: 'Não foi possível salvar a foto', description: error instanceof Error && /imagem|arquivo|MB/.test(error.message) ? error.message : 'Tente novamente em instantes.', variant: 'destructive' });
    } finally {
      busy.current = false;
      setUploading(false);
    }
  };

  const url = photo?.userId === userId ? photo.url : undefined;
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return <>
    <input ref={input} type="file" accept="image/*" className="hidden" aria-label="Selecionar foto de perfil" onChange={handleFile} />
    <Button variant="ghost" size="icon" className="dashboard-avatar-button relative h-11 w-11 shrink-0 rounded-full p-0" aria-label="Alterar foto de perfil" title="Alterar foto de perfil" disabled={uploading || !userId} aria-busy={uploading} onClick={() => input.current?.click()}>
      <Avatar className="dashboard-avatar h-11 w-11">
        {url && <AvatarImage src={url} alt={name} className="object-cover" />}
        <AvatarFallback className="bg-secondary text-gold text-sm font-semibold">{initials}</AvatarFallback>
      </Avatar>
      {uploading && <span className="dashboard-avatar-loading absolute inset-0 flex items-center justify-center rounded-full"><Loader2 className="h-5 w-5 animate-spin" /></span>}
    </Button>
  </>;
}