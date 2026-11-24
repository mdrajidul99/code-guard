import { CodeFormat } from '../types/index.ts';

/**
 * Copies text safely to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch {
    return false;
  }
}

/**
 * Downloads content as a real file using Blob URL and revokes it immediately.
 */
export function downloadFile(
  content: string,
  filename: string,
  _mimeType: string = 'text/plain;charset=utf-8'
): boolean {
  if (!content) return false;
  try {
    const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to get proper file extension and UTF-8 safe MIME type based on format.
 */
export function getFormatFileInfo(format: CodeFormat | 'javascript' | 'css'): { extension: string; mimeType: string } {
  switch (format) {
    case 'html':
      return { extension: '.html', mimeType: 'text/plain;charset=utf-8' };
    case 'blogger':
      return { extension: '.xml', mimeType: 'text/plain;charset=utf-8' };
    case 'javascript':
      return { extension: '.js', mimeType: 'text/plain;charset=utf-8' };
    case 'css':
      return { extension: '.css', mimeType: 'text/plain;charset=utf-8' };
    default:
      return { extension: '.txt', mimeType: 'text/plain;charset=utf-8' };
  }
}
