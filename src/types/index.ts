export type CodeFormat = 'html' | 'blogger';

export type StringArrayEncodingType = 'rc4' | 'base64' | 'none';

export interface SecuritySettings {
  stringArrayEncoding: StringArrayEncodingType;
  selfDefending: boolean;
  disableConsoleOutput: boolean;
  domainLock: string;
  allowBloggerPreview: boolean;
  hideCssAndHtmlInJs: boolean;
  antiInspectAndCopy: boolean;
}

export interface ProcessingProgress {
  stage: string;
  percent: number;
}

export interface ProcessingStats {
  originalSize: number;
  processedSize: number;
  reductionPercentage: number;
  durationMs: number;
  format: CodeFormat;
  timestamp: string;
  scriptsObfuscated: number;
  cssHidden: boolean;
  htmlHidden: boolean;
  domainLockActive: boolean;
}

export interface RestoreOptions {
  beautifyOnly: boolean;
  deescapeHex: boolean;
  deescapeUnicode: boolean;
  decodeBase64AndUnescape: boolean;
  indentSize: number;
}

export interface RestoreStats {
  originalSize: number;
  restoredSize: number;
  itemsDecoded: number;
  formatApplied: CodeFormat | 'javascript' | 'css';
  durationMs: number;
}

export interface BackupEntry {
  id: string;
  timestamp: number;
  format: CodeFormat;
  size: number;
  code: string;
  preview: string;
}

export type ActivePage =
  | 'home'
  | 'secure'
  | 'restore'
  | 'how-to-use'
  | 'privacy'
  | 'terms'
  | 'contact';
