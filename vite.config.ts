import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import JavaScriptObfuscator from 'javascript-obfuscator';

/**
 * Production self-protection plugin for CodeGuard.
 * Obfuscates CodeGuard's main compiled app JS chunks using RC4, Control Flow Flattening,
 * Self-Defending, and Disable Console Output while skipping Web Worker bundles
 * (which contain the javascript-obfuscator engine itself) and keeping safety flags false.
 */
function codeGuardBuildObfuscator(): Plugin {
  return {
    name: 'codeguard-build-obfuscator',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type !== 'chunk') continue;
        // Skip Web Worker bundles so javascript-obfuscator isn't obfuscated inside the worker
        if (/worker/i.test(fileName) || /obfuscator/i.test(fileName)) continue;
        if (!fileName.endsWith('.js')) continue;

        const result = JavaScriptObfuscator.obfuscate(chunk.code, {
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
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          selfDefending: true,
          disableConsoleOutput: true,
          ignoreImports: true,
          // Mandatory safety flags — remain false
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
    base: '/code-guard/',
    plugins: [
      react(),
      tailwindcss(),
      codeGuardBuildObfuscator(),
      {
        name: 'root-redirect-for-dev',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/' || req.url === '') {
              res.writeHead(302, { Location: '/code-guard/' });
              res.end();
              return;
            }
            next();
          });
        },
      },
    ],
    worker: {
      format: 'es',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
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
