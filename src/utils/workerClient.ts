import type { ObfuscatorOptions } from 'javascript-obfuscator';
import { protectNonAsciiWithUtf8Helper } from './utf8Guard.ts';

export interface WorkerObfuscateResponse {
  id: number;
  ok: boolean;
  code?: string;
  error?: string;
}

let sharedWorker: Worker | null = null;
let nextRequestId = 1;

interface PendingTask {
  resolve: (code: string) => void;
  reject: (err: Error) => void;
}

const pendingMap = new Map<number, PendingTask>();

function getWorker(): Worker {
  if (!sharedWorker) {
    const baseUrl = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/code-guard/';
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const workerUrl = `${normalizedBase}obfuscator-worker.js`;

    // Classic Web Worker so pre-built javascript-obfuscator UMD bundle & importScripts run without strict-mode globals errors
    sharedWorker = new Worker(workerUrl);

    sharedWorker.onmessage = (event: MessageEvent<WorkerObfuscateResponse>) => {
      const { id, ok, code, error } = event.data;
      const task = pendingMap.get(id);
      if (!task) return;
      pendingMap.delete(id);

      if (ok && typeof code === 'string') {
        task.resolve(code);
      } else {
        task.reject(new Error(error || 'Obfuscation failed in Web Worker.'));
      }
    };

    sharedWorker.onerror = (err) => {
      const errorObj = new Error(err.message || 'Web Worker execution error.');
      pendingMap.forEach((task) => task.reject(errorObj));
      pendingMap.clear();
      sharedWorker?.terminate();
      sharedWorker = null;
    };
  }
  return sharedWorker;
}

/**
 * Runs javascript-obfuscator inside a dedicated classic Web Worker so large files
 * (50KB-150KB+) never freeze the browser UI and avoid ESM strict-mode UMD issues.
 * Protects all non-ASCII (Bengali / Unicode / Emoji) strings via pure-ASCII Base64
 * (`_cgU8`) prior to obfuscation so RC4/Split Strings never corrupt UTF-8 bytes.
 */
export function obfuscateInWorker(code: string, options: ObfuscatorOptions): Promise<string> {
  if (!code || !code.trim()) {
    return Promise.resolve('');
  }

  const protectedCode = protectNonAsciiWithUtf8Helper(code);

  return new Promise<string>((resolve, reject) => {
    const id = nextRequestId++;
    pendingMap.set(id, { resolve, reject });
    try {
      const worker = getWorker();
      worker.postMessage({ id, code: protectedCode, options });
    } catch (err: unknown) {
      pendingMap.delete(id);
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
