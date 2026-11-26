export interface SandboxReconstructResult {
  styles: string[];
  mounts: Record<string, string>;
  writes: string[];
  injectorScriptIndexes: number[];
  guardScriptIndexes: number[];
}

const SANDBOX_TIMEOUT_MS = 3000;

/**
 * Runs candidate inline scripts inside a dedicated, network-free Virtual DOM Web Worker
 * with a strict 3-second timeout to safely extract injected CSS (<style>),
 * DOM mount HTML (.innerHTML), document.write() content, and CodeGuard runtime guards.
 */
export function runRestoreSandboxWorker(
  scripts: string[],
  mountIds: string[]
): Promise<SandboxReconstructResult> {
  const emptyResult: SandboxReconstructResult = {
    styles: [],
    mounts: {},
    writes: [],
    injectorScriptIndexes: [],
    guardScriptIndexes: [],
  };

  if (typeof Worker === 'undefined' || scripts.length === 0) {
    return Promise.resolve(emptyResult);
  }

  return new Promise<SandboxReconstructResult>((resolve) => {
    let worker: Worker | null = null;
    let settled = false;

    const finish = (res: SandboxReconstructResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        worker?.terminate();
      } catch {
        // Ignore cleanup errors
      }
      resolve(res);
    };

    const timer = setTimeout(() => {
      finish(emptyResult);
    }, SANDBOX_TIMEOUT_MS);

    try {
      const baseUrl = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/code-guard/';
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const workerUrl = `${normalizedBase}restore-sandbox-worker.js`;

      worker = new Worker(workerUrl);

      worker.onmessage = (ev: MessageEvent) => {
        const data = ev.data || {};
        if (data.ok) {
          finish({
            styles: Array.isArray(data.styles) ? data.styles : [],
            mounts: data.mounts && typeof data.mounts === 'object' ? data.mounts : {},
            writes: Array.isArray(data.writes) ? data.writes : [],
            injectorScriptIndexes: Array.isArray(data.injectorScriptIndexes)
              ? data.injectorScriptIndexes
              : [],
            guardScriptIndexes: Array.isArray(data.guardScriptIndexes)
              ? data.guardScriptIndexes
              : [],
          });
        } else {
          finish(emptyResult);
        }
      };

      worker.onerror = () => {
        finish(emptyResult);
      };

      worker.postMessage({
        id: 1,
        scripts,
        mountIds,
      });
    } catch {
      finish(emptyResult);
    }
  });
}
