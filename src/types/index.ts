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
  seoSafeMode: boolean;
  antiMirrorAndWebView: boolean;
  antiIframe: boolean;
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
  indentSize: number;
}

export interface RestoreStats {
  originalSize: number;
  restoredSize: number;
  itemsDecoded: number;
  passesUsed: number;
  vaultRecovered: boolean;
  sandboxReconstructed: boolean;
  formatApplied: CodeFormat | 'javascript' | 'css';
  durationMs: number;
}

export interface RestoreResult {
  code: string;
  stats: RestoreStats;
  notes: string[];
  nonReversibleLocked: boolean;
  xmlValidationError: string | null;
}

export interface BackupEntry {
  id: string;
  timestamp: number;
  format: CodeFormat;
  size: number;
  code: string;
  preview: string;
}

export interface VaultEntry {
  id: string;
  fullOutputHash: string;
  scriptHashes: string[];
  originalCode: string;
  format: CodeFormat;
  timestamp: number;
}

export type ActivePage =
  | 'home'
  | 'secure'
  | 'restore'
  | 'how-to-use'
  | 'privacy'
  | 'terms'
  | 'contact';
