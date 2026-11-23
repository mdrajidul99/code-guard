import { BackupEntry, CodeFormat } from '../types/index.ts';

const BACKUP_STORAGE_KEY = 'codeguard_backups_v1';
const MAX_BACKUPS = 5;

export function getStoredBackups(): BackupEntry[] {
  try {
    const raw = localStorage.getItem(BACKUP_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOriginalBackup(code: string, format: CodeFormat): BackupEntry[] {
  if (!code || !code.trim()) return getStoredBackups();

  try {
    const existing = getStoredBackups();
    // Avoid duplicating exact same code at the top of the stack
    if (existing.length > 0 && existing[0].code === code && existing[0].format === format) {
      return existing;
    }

    const cleanPreview = code
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 90);

    const newEntry: BackupEntry = {
      id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      format,
      size: code.length,
      code,
      preview: cleanPreview,
    };

    const updated = [newEntry, ...existing].slice(0, MAX_BACKUPS);
    localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    // Handle storage quota exceeded by storing fewer recent items
    try {
      const fallbackEntry: BackupEntry = {
        id: `bk_${Date.now()}`,
        timestamp: Date.now(),
        format,
        size: code.length,
        code,
        preview: code.trim().replace(/\s+/g, ' ').slice(0, 90),
      };
      const updated = [fallbackEntry];
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return getStoredBackups();
    }
  }
}

export function clearStoredBackups(): void {
  try {
    localStorage.removeItem(BACKUP_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
