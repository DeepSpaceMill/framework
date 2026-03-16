/**
 * Engine pack script.
 *
 * Packages game assets and engine files for distribution.
 * Supports Windows (native), Linux (native), and Web targets.
 *
 * Usage:
 *   yarn engine:pack --target=windows
 *   yarn engine:pack --target=linux --compress
 *   yarn engine:pack --target=web --compress --output=./dist
 *   node --experimental-default-type=module scripts/engine-pack.ts --target=web
 */

import { ZipWriter, configure } from '@zip.js/zip.js';
import { spawn } from 'node:child_process';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { Readable, Writable } from 'node:stream';
import { NATIVE_DIR, PROJECT_ROOT, WEB_DIR, log } from './lib/engine-utils.ts';

// Disable web workers – not available in Node.js
configure({ useWebWorkers: false });

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TMP_PACK_DIR = join(PROJECT_ROOT, '.moyu', 'tmp-pack');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Target = 'windows' | 'linux' | 'web';

const SUPPORTED_TARGETS = new Set<string>(['windows', 'linux', 'web']);

/** Native executable filename per target platform */
const NATIVE_EXECUTABLES: Record<string, string> = {
  windows: 'moyu.exe',
  linux: 'moyu',
};

interface Args {
  target: Target;
  compress: boolean;
  output: string | null;
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let target: Target | null = null;
  let compress = false;
  let output: string | null = null;

  for (const arg of argv) {
    if (arg.startsWith('--target=')) {
      const value = arg.slice('--target='.length);
      if (!SUPPORTED_TARGETS.has(value)) {
        log.error(
          `Unsupported target: "${value}".\n` +
            `Supported targets: ${[...SUPPORTED_TARGETS].join(', ')}`,
        );
        process.exit(1);
      }
      target = value as Target;
    } else if (arg === '--compress') {
      compress = true;
    } else if (arg.startsWith('--output=')) {
      output = arg.slice('--output='.length);
    }
  }

  if (!target) {
    log.error('Missing required argument: --target=<windows|linux|web>');
    process.exit(1);
  }

  return { target, compress, output };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a date-based string from current ISO time with all symbols stripped.
 * e.g. "2026-03-16T10:51:34.240Z" → "20260316105134240"
 */
function generateDateString(): string {
  return new Date().toISOString().replace(/[-:T.Z]/g, '');
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

/** Run rspack build and wait for completion. */
async function buildProject(): Promise<void> {
  log.info('Building project with rspack…');

  // Use the local rspack binary to avoid dependency on any package manager
  const rspackBin =
    process.platform === 'win32'
      ? join(PROJECT_ROOT, 'node_modules', '.bin', 'rspack.cmd')
      : join(PROJECT_ROOT, 'node_modules', '.bin', 'rspack');

  await new Promise<void>((resolve, reject) => {
    const child = spawn(rspackBin, ['build'], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      // Required on Windows: .cmd files must be invoked through the shell
      shell: process.platform === 'win32',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`rspack build exited with code ${code}`));
    });
  });

  log.success('Build complete.');
}

/**
 * Read entryFilename from index.json (fallback: index.js),
 * then copy the built bundle from dist/ to tmp-pack/.
 */
async function copyBundleJs(): Promise<void> {
  const indexJsonPath = join(PROJECT_ROOT, 'index.json');
  let entryFilename = 'index.js';

  if (existsSync(indexJsonPath)) {
    try {
      const parsed = JSON.parse(await readFile(indexJsonPath, 'utf-8'));
      if (typeof parsed.entryFilename === 'string' && parsed.entryFilename) {
        // Strip leading ./ if present (e.g. "./main.js" → "main.js")
        entryFilename = parsed.entryFilename.replace(/^\.[\/\\]/, '');
      }
    } catch {
      log.warn('Failed to parse index.json for entryFilename – using fallback "index.js".');
    }
  }

  const srcPath = join(PROJECT_ROOT, 'dist', entryFilename);
  if (!existsSync(srcPath)) {
    log.error(`Bundle not found: ${srcPath}`);
    process.exit(1);
  }

  log.info(`Copying bundle: ${basename(entryFilename)}`);
  await cp(srcPath, join(TMP_PACK_DIR, basename(entryFilename)));
}

// ---------------------------------------------------------------------------
// Pack steps
// ---------------------------------------------------------------------------

/** Create a clean tmp-pack directory. */
async function prepareTmpPack(): Promise<void> {
  if (existsSync(TMP_PACK_DIR)) {
    log.info('Cleaning existing tmp-pack directory…');
    await rm(TMP_PACK_DIR, { recursive: true, force: true });
  }
  await mkdir(TMP_PACK_DIR, { recursive: true });
}

/** Copy `assets/` → `tmp-pack/assets/`. */
async function copyAssets(): Promise<void> {
  const assetsDir = join(PROJECT_ROOT, 'assets');
  if (!existsSync(assetsDir)) {
    log.error('Assets directory not found.');
    process.exit(1);
  }
  log.info('Copying assets…');
  await cp(assetsDir, join(TMP_PACK_DIR, 'assets'), { recursive: true });
}

/** Copy `index.json` → `tmp-pack/index.json`. */
async function copyIndexJson(): Promise<void> {
  const indexJson = join(PROJECT_ROOT, 'index.json');
  if (!existsSync(indexJson)) {
    log.error('index.json not found.');
    process.exit(1);
  }
  log.info('Copying index.json…');
  await cp(indexJson, join(TMP_PACK_DIR, 'index.json'));
}

/** Copy the native engine executable for the given target. */
async function copyNativeEngine(target: 'windows' | 'linux'): Promise<void> {
  const exeName = NATIVE_EXECUTABLES[target];
  const exePath = join(NATIVE_DIR, exeName);

  if (!existsSync(exePath)) {
    log.error(
      `Engine executable not found: ${exePath}\n` +
        'Run "yarn engine:update" to download engine files.',
    );
    process.exit(1);
  }

  log.info(`Copying native engine executable: ${exeName}`);
  await cp(exePath, join(TMP_PACK_DIR, exeName));
}

/** Copy all web engine files and index.html for the web target. */
async function copyWebEngine(): Promise<void> {
  if (!existsSync(WEB_DIR)) {
    log.error(
      'Web engine directory not found. Run "yarn engine:update" first.',
    );
    process.exit(1);
  }

  log.info('Copying web engine files…');
  await cp(WEB_DIR, TMP_PACK_DIR, { recursive: true });

  const indexHtml = join(PROJECT_ROOT, 'index.html');
  if (!existsSync(indexHtml)) {
    log.error('index.html not found in project root.');
    process.exit(1);
  }
  log.info('Copying index.html…');
  await cp(indexHtml, join(TMP_PACK_DIR, 'index.html'));
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

/**
 * Recursively walk `dirPath` and add every file to `zipWriter`.
 * Entries are stored under `zipBasePath/filename` (forward-slash separated).
 * UTF-8 flag (EFS bit 11) is set on every entry so filenames are always
 * decoded as UTF-8 by conforming unzippers.
 */
async function addDirToZip(
  zipWriter: ZipWriter<unknown>,
  dirPath: string,
  zipBasePath: string,
): Promise<void> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    const entryName = zipBasePath ? `${zipBasePath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await addDirToZip(zipWriter, fullPath, entryName);
    } else {
      // Stream-based reading – avoids loading large assets into memory
      const readable = Readable.toWeb(
        createReadStream(fullPath),
      ) as ReadableStream<Uint8Array>;
      await zipWriter.add(entryName, readable, {
        // Set the Language Encoding Flag (EFS, general purpose bit 11) so
        // all zip tools decode filenames as UTF-8, including Chinese paths.
        useUnicodeFileNames: true,
        level: 6,
      });
    }
  }
}

/**
 * Create a zip archive from tmp-pack contents.
 * Files are placed at the archive root (no wrapping directory).
 * Filenames are stored with the UTF-8 / EFS flag (bit 11) set
 * via `useUnicodeFileNames: true` (the library default, made explicit here).
 */
async function createZip(outputDir: string): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  const zipPath = join(outputDir, 'game.zip');

  log.info(`Creating zip archive: ${zipPath}`);

  const writableStream = Writable.toWeb(
    createWriteStream(zipPath),
  ) as WritableStream<Uint8Array>;

  // useUnicodeFileNames sets EFS bit 11 on all entries, ensuring UTF-8
  // filename decoding even on tools that do not auto-detect encoding.
  const zipWriter = new ZipWriter(writableStream, {
    level: 6,
    useUnicodeFileNames: true,
  });
  await addDirToZip(zipWriter, TMP_PACK_DIR, '');
  await zipWriter.close();

  const { size } = await stat(zipPath);
  log.success(`Archive created: ${zipPath} (${formatBytes(size)})`);
}

/** Copy tmp-pack contents to the output directory as `game/`. */
async function copyToOutput(outputDir: string): Promise<void> {
  const gamePath = join(outputDir, 'game');
  await mkdir(gamePath, { recursive: true });

  log.info(`Copying files to: ${gamePath}`);
  await cp(TMP_PACK_DIR, gamePath, { recursive: true });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs();

  const dateString = generateDateString();
  const outputDir = args.output
    ? resolve(PROJECT_ROOT, args.output)
    : join(PROJECT_ROOT, '.moyu', 'release', dateString);

  log.info(`Target: ${args.target}`);
  log.info(`Compress: ${args.compress}`);
  log.info(`Output: ${outputDir}`);

  // 1. Build the project
  await buildProject();

  // 2. Prepare tmp-pack directory
  await prepareTmpPack();

  // 3. Copy common files
  await copyAssets();
  await copyIndexJson();
  await copyBundleJs();

  // 4. Copy platform-specific files
  if (args.target === 'web') {
    await copyWebEngine();
  } else {
    await copyNativeEngine(args.target);
  }

  // 5. Output
  if (args.compress) {
    await createZip(outputDir);
  } else {
    await copyToOutput(outputDir);
  }

  // 6. Cleanup
  log.info('Cleaning up tmp-pack…');
  await rm(TMP_PACK_DIR, { recursive: true, force: true });

  log.success('Pack complete!');
}

main().catch((err: Error) => {
  log.error(err.message);
  process.exit(1);
});
