/**
 * Engine debug-run script.
 *
 * Launches the downloaded engine in native mode (child process) or
 * web mode (local HTTP dev server with layered static file serving).
 *
 * Usage:
 *   yarn engine:native          # or --native / -n
 *   yarn engine:web             # or --web / -w  [--port 6320]
 *   node --experimental-default-type=module scripts/engine-run.ts --native
 */

import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { NATIVE_DIR, PROJECT_ROOT, WEB_DIR, loadMeta, log } from './lib/engine-utils.ts';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

type Mode = 'native' | 'web';

interface Args {
  mode: Mode;
  port: number;
}

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let mode: Mode = 'native';
  let port = 6320;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--native' || arg === '-n') {
      mode = 'native';
    } else if (arg === '--web' || arg === '-w') {
      mode = 'web';
    } else if (arg === '--port' && argv[i + 1]) {
      port = Number.parseInt(argv[++i], 10);
      if (Number.isNaN(port) || port < 1 || port > 65535) {
        log.error('Invalid port number.');
        process.exit(1);
      }
    }
  }

  return { mode, port };
}

// ---------------------------------------------------------------------------
// Prerequisite check
// ---------------------------------------------------------------------------

async function ensureEngineDownloaded(): Promise<void> {
  const meta = await loadMeta();
  if (!meta) {
    log.error('Engine is not downloaded yet. Run "yarn engine:update" first.');
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Native mode
// ---------------------------------------------------------------------------

function runNative(): void {
  const exeName = process.platform === 'win32' ? 'moyu.exe' : 'moyu';
  const enginePath = join(NATIVE_DIR, exeName);

  if (!existsSync(enginePath)) {
    log.error(
      `Engine binary not found at ${enginePath}\n` +
        'The engine files may be corrupted. Run "yarn engine:update" to re-download.',
    );
    process.exit(1);
  }

  log.info(`Starting native engine: ${enginePath}`);
  log.info(`Working directory: ${PROJECT_ROOT}`);

  const child = spawn(enginePath, ['--entry', 'http://localhost:6020/index.json'], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    log.error(`Failed to start engine: ${err.message}`);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      log.info(`Engine terminated by signal: ${signal}`);
      process.exit(1);
    }
    process.exit(code ?? 0);
  });

  // Forward termination signals to child process
  const forwardSignal = (sig: NodeJS.Signals) => {
    child.kill(sig);
  };
  process.on('SIGINT', () => forwardSignal('SIGINT'));
  process.on('SIGTERM', () => forwardSignal('SIGTERM'));
}

// ---------------------------------------------------------------------------
// Web mode – layered static file server
// ---------------------------------------------------------------------------

/** MIME types for common file extensions */
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.opus': 'audio/opus',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

/**
 * Resolve a URL path to a real file path, checking the layered roots
 * in priority order: WEB_DIR first, then PROJECT_ROOT.
 *
 * Returns `null` if no matching file is found.
 */
function resolveFilePath(urlPath: string): string | null {
  // Normalize and strip query / hash
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const relative = normalize(clean).replace(/^[\\/]+/, '');

  const roots = [WEB_DIR, PROJECT_ROOT];

  for (const root of roots) {
    const candidate = resolve(root, relative);

    // Security: prevent path traversal outside the root
    if (!candidate.startsWith(root)) continue;

    if (!existsSync(candidate)) continue;

    const st = statSync(candidate);
    if (st.isFile()) return candidate;

    // Directory → try index.html
    if (st.isDirectory()) {
      const index = join(candidate, 'index.html');
      if (existsSync(index) && statSync(index).isFile()) return index;
    }
  }

  return null;
}

async function runWeb(port: number): Promise<void> {
  if (!existsSync(WEB_DIR)) {
    log.error('Web engine assets not found. Run "yarn engine:update" first.');
    process.exit(1);
  }

  // Verify it's not empty
  const entries = await readdir(WEB_DIR);
  if (entries.length === 0) {
    log.error('Web engine directory is empty. Run "yarn engine:update" to re-download.');
    process.exit(1);
  }

  const server = createServer(async (req, res) => {
    const urlPath = req.url ?? '/';
    const filePath = resolveFilePath(urlPath);

    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

    // Add CORS and special headers for .wasm
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    };

    // Required for SharedArrayBuffer (used by WASM threads)
    if (ext === '.html') {
      headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
      headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    }

    try {
      const data = await readFile(filePath);
      res.writeHead(200, headers);
      res.end(data);
    } catch {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  });

  // Try to bind to the requested port; auto-increment on EADDRINUSE
  const maxRetries = 10;
  let currentPort = port;

  const tryListen = (): Promise<void> =>
    new Promise((resolve, reject) => {
      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE' && currentPort < port + maxRetries) {
          currentPort++;
          log.warn(`Port ${currentPort - 1} in use, trying ${currentPort}…`);
          tryListen().then(resolve, reject);
        } else {
          reject(err);
        }
      });
      server.listen(currentPort, () => resolve());
    });

  await tryListen();

  const url = `http://localhost:${currentPort}`;
  log.success(`Web engine server running at ${url}`);
  log.info('Serving files from:');
  log.info(`  1. ${WEB_DIR} (engine)`);
  log.info(`  2. ${PROJECT_ROOT} (project)`);
  log.info('Press Ctrl+C to stop.\n');

  // Graceful shutdown
  process.on('SIGINT', () => {
    log.info('\nShutting down server…');
    server.close(() => process.exit(0));
  });
  process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs();

  await ensureEngineDownloaded();

  if (args.mode === 'native') {
    runNative();
  } else {
    await runWeb(args.port);
  }
}

main().catch((err: Error) => {
  log.error(err.message);
  process.exit(1);
});
