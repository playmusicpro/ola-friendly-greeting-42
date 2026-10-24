import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ session: null }) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
import ProfileAvatar from './ProfileAvatar';

describe('ProfileAvatar sem sessão', () => {
  it('não falha durante o carregamento inicial sem usuário', () => {
    expect(() => render(<ProfileAvatar name="Foto Demonstração" />)).not.toThrow();
    expect(screen.getByRole('button', { name: 'Alterar foto de perfil' })).toBeDisabled();
  });
});