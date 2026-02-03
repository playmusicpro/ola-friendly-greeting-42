/**
 * Performance Utilities
 * Lazy loading, caching, and optimization helpers
 */

import { Song, Setlist } from '@/types';

// ============= SETLIST CACHE =============

interface CachedSetlist {
  setlist: Setlist;
  songs: Song[];
  timestamp: number;
}

const CACHE_KEY = 'modoshow_cache';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Cache a setlist with its songs for offline mode-show usage
 */
export function cacheSetlistForShow(setlist: Setlist, songs: Song[]): void {
  try {
    const cached: CachedSetlist = {
      setlist,
      songs,
      timestamp: Date.now(),
    };
    
    const existing = getCachedSetlists();
    existing[setlist.id] = cached;
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.warn('Failed to cache setlist:', error);
  }
}

/**
 * Get all cached setlists
 */
export function getCachedSetlists(): Record<string, CachedSetlist> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    
    const parsed = JSON.parse(cached) as Record<string, CachedSetlist>;
    
    // Clean expired entries
    const now = Date.now();
    Object.keys(parsed).forEach(key => {
      if (now - parsed[key].timestamp > CACHE_TTL) {
        delete parsed[key];
      }
    });
    
    return parsed;
  } catch {
    return {};
  }
}

/**
 * Get a cached setlist by ID
 */
export function getCachedSetlist(id: string): CachedSetlist | null {
  const cached = getCachedSetlists();
  const entry = cached[id];
  
  if (!entry) return null;
  
  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    clearCachedSetlist(id);
    return null;
  }
  
  return entry;
}

/**
 * Clear a specific cached setlist
 */
export function clearCachedSetlist(id: string): void {
  try {
    const cached = getCachedSetlists();
    delete cached[id];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.warn('Failed to clear cached setlist:', error);
  }
}

/**
 * Clear all cached setlists
 */
export function clearAllCachedSetlists(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear all cached setlists:', error);
  }
}

// ============= LAZY LOADING HELPERS =============

/**
 * Chunk an array into smaller arrays for lazy loading
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Create a simple debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Create a throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============= PRELOAD UTILITIES =============

/**
 * Preload images for a setlist (if songs have album art)
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      });
    })
  );
}

// ============= SERVICE WORKER REGISTRATION =============

/**
 * Register service worker for offline support
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.warn('ServiceWorker registration failed:', error);
      return null;
    }
  }
  return null;
}

// ============= MEMORY MANAGEMENT =============

/**
 * Estimate localStorage usage
 */
export function getLocalStorageUsage(): { used: number; total: number; percentage: number } {
  let used = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      used += (key.length + (value?.length || 0)) * 2; // UTF-16 = 2 bytes per char
    }
  }
  
  // Browsers typically allow 5-10 MB
  const total = 5 * 1024 * 1024; // 5 MB estimate
  
  return {
    used,
    total,
    percentage: (used / total) * 100,
  };
}

/**
 * Clean up old data if storage is getting full
 */
export function cleanupOldData(threshold = 80): void {
  const usage = getLocalStorageUsage();
  
  if (usage.percentage > threshold) {
    // Clear old cached setlists first
    clearAllCachedSetlists();
    console.log('Cleaned up cached setlists due to storage pressure');
  }
}
