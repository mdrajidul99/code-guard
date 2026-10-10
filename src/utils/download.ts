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
      // Fallback using temporary textarea
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
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

/**
 * Downloads content as a real file using Blob URL and revokes it immediately.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain;charset=utf-8'
): boolean {
  if (!content) return false;
  try {
    const sanitizedName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (err) {
    console.error('File download failed:', err);
    return false;
  }
}

/**
 * Helper to get proper file extension and MIME type based on format.
 */
export function getFormatFileInfo(format: CodeFormat, isBackup = false): { extension: string; mimeType: string } {
  const prefix = isBackup ? 'backup_' : 'codegaurd_';
  switch (format) {
    case 'html':
      return { extension: '.html', mimeType: 'text/html;charset=utf-8' };
    case 'javascript':
      return { extension: '.js', mimeType: 'text/javascript;charset=utf-8' };
    case 'css':
      return { extension: '.css', mimeType: 'text/css;charset=utf-8' };
    case 'blogger':
      return { extension: '.xml', mimeType: 'application/xml;charset=utf-8' };
    default:
      return { extension: '.txt', mimeType: 'text/plain;charset=utf-8' };
  }
}
