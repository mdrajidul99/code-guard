import { CodeFormat, VaultEntry } from '../types/index.ts';

const IDB_NAME = 'codeguard_vault_db';
const IDB_VERSION = 1;
const IDB_STORE = 'vault_entries';
const LS_FALLBACK_KEY = 'codeguard_vault_v1';
const MAX_VAULT_ENTRIES = 50;

/**
 * Normalizes whitespace so minor formatting or line-ending differences
 * do not break hash matching.
 */
export function normalizeForHash(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts normalized inner bodies of all non-empty inline <script> tags
 * (stripping CDATA wrappers so Blogger view-source vs XML editor matches cleanly).
 */
export function extractScriptBodiesForHash(source: string): string[] {
  const bodies: string[] = [];
  const regex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(source)) !== null) {
    const attrs = match[1] || '';
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (/\btype\s*=\s*["']?(?:application\/(?:ld\+)?json|text\/template|text\/x-template|importmap)["']?/i.test(attrs)) {
      continue;
    }

    const cleaned = (match[2] || '')
      .replace(/\/\/<!\[CDATA\[/gi, '')
      .replace(/\/\/\]\]>/gi, '')
      .replace(/<!\[CDATA\[/gi, '')
      .replace(/\]\]>/gi, '');

    const normalized = normalizeForHash(cleaned);
    // Ignore tiny snippets under 40 chars to prevent accidental collisions
    if (normalized.length >= 40) {
      bodies.push(normalized);
    }
  }

  return bodies;
}

/**
 * Pure JS fallback SHA-256 implementation for environments lacking crypto.subtle.
 */
function sha256Fallback(str: string): string {
  const utf8 = new TextEncoder().encode(str);
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const bitLen = utf8.length * 8;
  const paddedLen = Math.ceil((utf8.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(utf8);
  padded[utf8.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);

  const w = new Uint32Array(64);
  const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return Array.from(H).map((x) => x.toString(16).padStart(8, '0')).join('');
}

export async function sha256Hex(text: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const data = new TextEncoder().encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Fallback below
  }
  return sha256Fallback(text);
}

function openVaultDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('Failed to open Vault DB'));
  });
}

async function readAllFromIdb(): Promise<VaultEntry[] | null> {
  try {
    const db = await openVaultDb();
    return await new Promise<VaultEntry[]>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = Array.isArray(req.result) ? (req.result as VaultEntry[]) : [];
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null;
  }
}

async function writeAllToIdb(entries: VaultEntry[]): Promise<boolean> {
  try {
    const db = await openVaultDb();
    return await new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.clear();
      for (const entry of entries) {
        store.put(entry);
      }
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return false;
  }
}

function readFromLocalStorage(): VaultEntry[] {
  try {
    const raw = localStorage.getItem(LS_FALLBACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as VaultEntry[]) : [];
  } catch {
    return [];
  }
}

function writeToLocalStorage(entries: VaultEntry[]): void {
  try {
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(entries.slice(0, MAX_VAULT_ENTRIES)));
  } catch {
    // If quota exceeded, keep fewer recent items cleanly
    try {
      localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(entries.slice(0, 10)));
    } catch {
      try {
        localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(entries.slice(0, 2)));
      } catch {
        // Ignore storage failure
      }
    }
  }
}

export async function getVaultEntries(): Promise<VaultEntry[]> {
  const idbEntries = await readAllFromIdb();
  if (idbEntries !== null) {
    return idbEntries;
  }
  return readFromLocalStorage();
}

export async function saveToVault(params: {
  originalCode: string;
  outputCode: string;
  format: CodeFormat;
}): Promise<void> {
  const { originalCode, outputCode, format } = params;
  if (!originalCode.trim() || !outputCode.trim()) return;

  const fullOutputHash = await sha256Hex(normalizeForHash(outputCode));
  const scriptBodies = extractScriptBodiesForHash(outputCode);
  const scriptHashes = await Promise.all(scriptBodies.map((b) => sha256Hex(b)));

  const existing = await getVaultEntries();
  const filtered = existing.filter((e) => e.fullOutputHash !== fullOutputHash);

  const newEntry: VaultEntry = {
    id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fullOutputHash,
    scriptHashes,
    originalCode,
    format,
    timestamp: Date.now(),
  };

  const updated = [newEntry, ...filtered].slice(0, MAX_VAULT_ENTRIES);
  const savedIdb = await writeAllToIdb(updated);
  if (!savedIdb) {
    writeToLocalStorage(updated);
  }
}

/**
 * Finds a matching vault entry by comparing:
 *  1) Exact normalized fullOutputHash, OR
 *  2) Highest number of matching inner <script> block SHA-256 hashes
 *     (resilient to Blogger view-source injecting extra meta/widget tags).
 */
export async function findVaultMatch(pastedCode: string): Promise<VaultEntry | null> {
  const entries = await getVaultEntries();
  if (entries.length === 0) return null;

  const pastedFullHash = await sha256Hex(normalizeForHash(pastedCode));
  const exactMatch = entries.find((e) => e.fullOutputHash === pastedFullHash);
  if (exactMatch) return exactMatch;

  const pastedScriptBodies = extractScriptBodiesForHash(pastedCode);
  if (pastedScriptBodies.length === 0) return null;

  const pastedScriptHashes = new Set(
    await Promise.all(pastedScriptBodies.map((b) => sha256Hex(b)))
  );

  let bestMatch: VaultEntry | null = null;
  let bestScore = 0;

  for (const entry of entries) {
    if (!entry.scriptHashes || entry.scriptHashes.length === 0) continue;
    let matches = 0;
    for (const h of entry.scriptHashes) {
      if (pastedScriptHashes.has(h)) matches++;
    }
    if (matches > bestScore) {
      bestScore = matches;
      bestMatch = entry;
    }
  }

  return bestScore > 0 ? bestMatch : null;
}
