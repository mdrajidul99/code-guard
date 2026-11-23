import JavaScriptObfuscator from 'javascript-obfuscator';
import type { ObfuscatorOptions } from 'javascript-obfuscator';

export interface WorkerObfuscateRequest {
  id: number;
  code: string;
  options: ObfuscatorOptions;
}

export interface WorkerObfuscateResponse {
  id: number;
  ok: boolean;
  code?: string;
  error?: string;
}

self.onmessage = (event: MessageEvent<WorkerObfuscateRequest>) => {
  const { id, code, options } = event.data;
  try {
    const result = JavaScriptObfuscator.obfuscate(code, options);
    const obfuscatedCode = result.getObfuscatedCode();
    const response: WorkerObfuscateResponse = {
      id,
      ok: true,
      code: obfuscatedCode,
    };
    self.postMessage(response);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const response: WorkerObfuscateResponse = {
      id,
      ok: false,
      error: message,
    };
    self.postMessage(response);
  }
};
