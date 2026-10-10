export type CodeFormat = 'html' | 'javascript' | 'css' | 'blogger' | 'auto';

export interface SecureOptions {
  // HTML Options
  htmlMinifyWhitespace: boolean;
  htmlRemoveComments: boolean;
  htmlMinifyInlineCss: boolean;
  htmlMinifyInlineJs: boolean;
  htmlProtectContainer: boolean;

  // JavaScript Options
  jsMinifyWhitespace: boolean;
  jsRemoveComments: boolean;
  jsMangleIdentifiers: boolean;
  jsEncodeStringsHex: boolean;
  jsStringArrayRotation: boolean;
  jsConvertNumbersToHex: boolean;
  jsAddTamperProtection: boolean;

  // CSS Options
  cssMinifyWhitespace: boolean;
  cssRemoveComments: boolean;
  cssShortenHexColors: boolean;
  cssRemoveZeroUnits: boolean;

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
