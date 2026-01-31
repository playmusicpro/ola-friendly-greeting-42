interface ShareLink {
  slug: string;
  route: string;
  fullUrl: string;
  expiresAt: string | null;
}

interface WhatsAppShareOptions {
  title: string;
  shortLink: string;
  description?: string;
  hotmartLink?: string;
  includeHotmart?: boolean;
}

const DOMAIN = 'playpro.app';

/**
 * Generates a unique short slug for sharing
 */
export const generateSlug = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

/**
 * Creates a share link object
 */
export const createShareLink = (type: 'setlist' | 'song', id: string): ShareLink => {
  const slug = generateSlug();
  return {
    slug,
    route: `/${type}/${slug}`,
    fullUrl: `https://${DOMAIN}/s/${slug}`,
    expiresAt: null, // Links don't expire by default
  };
};

/**
 * Generates a WhatsApp share message in Portuguese
 */
export const generateWhatsAppMessage = (options: WhatsAppShareOptions): string => {
  const { title, shortLink, description, hotmartLink, includeHotmart } = options;
  
  let message = `Fala! 🎸\n\nConfira meu setlist: "${title}".\n\nVeja aqui: ${shortLink}`;
  
  if (description) {
    message += `\n\nDescrição: ${description}`;
  }
  
  if (includeHotmart && hotmartLink) {
    message += `\n\n🔑 Acesse a área de membros: ${hotmartLink}`;
  }
  
  message += '\n\n— Criado com Play Pro 🎵';
  
  return message;
};

/**
 * Creates a WhatsApp deep link with encoded message
 */
export const createWhatsAppLink = (message: string): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/?text=${encodedMessage}`;
};

/**
 * Opens WhatsApp with pre-filled message
 * Accepts either WhatsAppShareOptions or a plain string message
 */
export const shareViaWhatsApp = (options: WhatsAppShareOptions | string): void => {
  let message: string;
  
  if (typeof options === 'string') {
    message = options;
  } else {
    message = generateWhatsAppMessage(options);
  }
  
  const link = createWhatsAppLink(message);
  window.open(link, '_blank');
};

/**
 * Copies text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

/**
 * Generates a share preview text (max 180 chars)
 */
export const generateSharePreview = (
  type: 'setlist' | 'song',
  title: string,
  itemCount?: number
): string => {
  if (type === 'setlist' && itemCount) {
    return `${title} — ${itemCount} música${itemCount > 1 ? 's' : ''}. Clique para abrir no Play Pro.`;
  }
  return `${title}. Clique para abrir no Play Pro.`;
};
