import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import JavaScriptObfuscator from 'javascript-obfuscator';
import { protectNonAsciiWithUtf8Helper } from './src/utils/utf8Guard.ts';

const BUILD_OBFUSCATOR_EXCLUDES: RegExp[] = [
  /worker/i,
  /obfuscator/i,
  /javascript-obfuscator/i,
  /node_modules[\\/]+javascript-obfuscator/i,
  /acorn/i,
  /vendor/i,
];

function isExcludedChunk(fileName: string, moduleIds: string[]): boolean {
  if (BUILD_OBFUSCATOR_EXCLUDES.some((re) => re.test(fileName))) {
    return true;
  }
  return moduleIds.some((id) =>
    /node_modules[\\/]+(?:javascript-obfuscator|acorn)|obfuscator-worker|restore-sandbox-worker/i.test(id)
  );
}

/**
 * Production self-protection plugin for CodeGuard.
 * Obfuscates ONLY CodeGuard's own compiled app UI chunk (after pure-ASCII UTF-8 guarding)
 * using RC4 string array encryption, splitStrings, numbersToExpressions, and Disable Console Output
 * while keeping selfDefending, controlFlowFlattening, renameGlobals, and renameProperties FALSE
 * so the React/Vite bundle mounts reliably on GitHub Pages, and strictly excluding Web Workers,
 * javascript-obfuscator, acorn, and node_modules vendor chunks.
 */
function codeGuardBuildObfuscator(): Plugin {
  return {
    name: 'codeguard-build-obfuscator',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue;
        if (!fileName.endsWith('.js')) continue;

        const moduleIds = chunk.moduleIds || Object.keys(chunk.modules || {});
        if (isExcludedChunk(fileName, moduleIds)) continue;

        const asciiSafeCode = protectNonAsciiWithUtf8Helper(chunk.code);

        const result = JavaScriptObfuscator.obfuscate(asciiSafeCode, {
          compact: true,
          simplify: true,
          target: 'browser',
          identifierNamesGenerator: 'hexadecimal',
          stringArray: true,
          stringArrayThreshold: 1,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayIndexShift: true,
          stringArrayIndexesType: ['hexadecimal-number'],
          stringArrayWrappersCount: 1,
          stringArrayWrappersType: 'variable',
          stringArrayWrappersChainedCalls: true,
          stringArrayEncoding: ['rc4'],
          splitStrings: true,
          splitStringsChunkLength: 10,
          numbersToExpressions: true,
          disableConsoleOutput: true,
          ignoreImports: true,
          // Mandatory safety flags — remain false so React/Vite mount never breaks on GitHub Pages
          controlFlowFlattening: false,
          selfDefending: false,
          renameGlobals: false,
          renameProperties: false,
          transformObjectKeys: false,
          deadCodeInjection: false,
          debugProtection: false,
        });

        chunk.code = result.getObfuscatedCode();
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      codeGuardBuildObfuscator(),
    ],
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'obfuscator-vendor',
                test: /node_modules[\\/](?:javascript-obfuscator|acorn)/,
              },
              {
                name: 'vendor',
                test: /node_modules/,
              },
            ],
          },
        },
      },
    },
    optimizeDeps: {
      exclude: ['javascript-obfuscator'],
    },
    worker: {
      format: 'iife',
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
