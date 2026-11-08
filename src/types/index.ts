export type CodeFormat = 'html' | 'blogger';

export interface SecureOptions {
  // HTML Options
  htmlMinifyWhitespace: boolean;
  htmlRemoveComments: boolean;
  htmlMinifyInlineCss: boolean;
  htmlMinifyInlineJs: boolean;
  htmlProtectContainer: boolean;

  // JavaScript Options (used for inline scripts)
  jsMinifyWhitespace?: boolean;
  jsRemoveComments?: boolean;

  // CSS Options (used for inline styles / Blogger skin)
  cssMinifyWhitespace?: boolean;
  cssRemoveComments?: boolean;
  cssShortenHexColors?: boolean;
  cssRemoveZeroUnits?: boolean;

  // Blogger XML Options
  bloggerValidateXml: boolean;
  bloggerMinifyWhitespace: boolean;
  bloggerMinifyCdataCss: boolean;
  bloggerProtectTags: boolean;
}

export interface RestoreOptions {
  beautifyOnly: boolean;
  deescapeHex: boolean;
  deescapeUnicode: boolean;
  resolveStringArrays: boolean;
  indentSize: number;
}

export interface ProcessingStats {
  originalSize: number;
  processedSize: number;
  reductionPercentage: number;
  durationMs: number;
  detectedFormat?: CodeFormat;
  timestamp: string;
}

export interface RestoreStats {
  originalSize: number;
  restoredSize: number;
  stringsDecoded: number;
  formatApplied: CodeFormat;
  durationMs: number;
}

export type ActivePage =
  | 'home'
  | 'secure'
  | 'restore'
  | 'how-to-use'
  | 'privacy'
  | 'terms'
  | 'contact';
