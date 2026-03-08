/**
 * Shared utilities for engine management scripts.
 *
 * Provides config loading, platform detection, version metadata,
 * and download/extraction helpers.
 */

import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createZstdDecompress } from 'node:zlib';
import pc from 'picocolors';
import { extract as tarExtract } from 'tar';

// ---------------------------------------------------------------------------
// Constants & Paths
// ---------------------------------------------------------------------------

export const DEFAULT_CDN_URL =
  'https://cdn.momoyu.ink/releases/versions.json';
export const DEFAULT_CHANNEL = 'dev';

/** Project root – assumes the script is invoked from `<root>/scripts/…` */
export const PROJECT_ROOT = resolve(
  import.meta.dirname ?? dirname(new URL(import.meta.url).pathname),
  '../..',
);

export const ENGINE_DIR = join(PROJECT_ROOT, '.moyu', 'engine');
export const META_FILE = join(ENGINE_DIR, 'meta.json');
export const NATIVE_DIR = join(ENGINE_DIR, 'native');
export const WEB_DIR = join(ENGINE_DIR, 'web');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** `moyu.json` → `engine` section */
export interface EngineConfig {
  cdnUrl: string;
  version: string | null;
  channel: string;
}

/** Top-level CDN versions.json */
export interface VersionsJson {
  schema_version: number;
  channels: Record<string, Channel>;
}

export interface Channel {
  latest: string;
  versions: Record<string, VersionEntry>;
}

export interface VersionEntry {
  published_at: string;
  assets: Record<string, Asset>;
}

export interface Asset {
  url: string;
  sha256: string;
  size: number;
}

/** Local metadata stored at `.moyu/engine/meta.json` */
export interface Meta {
  version: string;
  channel: string;
  publishedAt: string;
  native: {
    platform: string;
    url: string;
    sha256: string;
  };
  web: {
    url: string;
    sha256: string;
  } | null;
  downloadedAt: string;
}

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------

export const log = {
  info: (msg: string) => console.log(pc.cyan('ℹ'), msg),
  success: (msg: string) => console.log(pc.green('✔'), msg),
  warn: (msg: string) => console.warn(pc.yellow('⚠'), msg),
  error: (msg: string) => console.error(pc.red('✖'), msg),
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/**
 * Read the `engine` section from `<root>/moyu.json`.
 * Returns sensible defaults when the file or section is absent.
 */
export function loadConfig(): EngineConfig {
  const configPath = join(PROJECT_ROOT, 'moyu.json');
  const defaults: EngineConfig = {
    cdnUrl: DEFAULT_CDN_URL,
    version: null,
    channel: DEFAULT_CHANNEL,
  };

  if (!existsSync(configPath)) return defaults;

  try {
    const raw = JSON.parse(
      // Intentionally synchronous – runs once at startup
      require('node:fs').readFileSync(configPath, 'utf-8'),
    );
    const engine = raw?.engine ?? {};
    return {
      cdnUrl:
        typeof engine.cdnUrl === 'string' ? engine.cdnUrl : defaults.cdnUrl,
      version:
        typeof engine.version === 'string' ? engine.version : defaults.version,
      channel:
        typeof engine.channel === 'string'
          ? engine.channel
          : defaults.channel,
    };
  } catch {
    log.warn('Failed to parse moyu.json – using default engine config.');
    return defaults;
  }
}

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

const PLATFORM_MAP: Record<string, Record<string, string>> = {
  win32: { x64: 'windows-amd64' },
  linux: { x64: 'linux-amd64', arm64: 'linux-aarch64' },
  darwin: { x64: 'macos-amd64', arm64: 'macos-aarch64' },
};

/**
 * Map `process.platform` + `process.arch` to the CDN asset key.
 * Exits with code 1 if the current platform is unsupported.
 */
export function detectPlatform(): string {
  const key = PLATFORM_MAP[process.platform]?.[process.arch];
  if (key) return key;

  const supported = Object.entries(PLATFORM_MAP)
    .flatMap(([os, archs]) =>
      Object.entries(archs).map(([arch, k]) => `  ${os}/${arch} → ${k}`),
    )
    .join('\n');
  log.error(
    `Unsupported platform: ${process.platform}/${process.arch}\nSupported platforms:\n${supported}`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function loadMeta(): Promise<Meta | null> {
  if (!existsSync(META_FILE)) return null;
  try {
    return JSON.parse(await readFile(META_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

export async function saveMeta(meta: Meta): Promise<void> {
  await mkdir(dirname(META_FILE), { recursive: true });
  await writeFile(META_FILE, JSON.stringify(meta, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Remote fetch
// ---------------------------------------------------------------------------

/**
 * Fetch and parse the CDN `versions.json`.
 * Validates `schema_version` before returning.
 */
export async function fetchVersionsJson(
  cdnUrl: string,
): Promise<VersionsJson> {
  const res = await fetch(cdnUrl);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch versions.json: HTTP ${res.status} ${res.statusText}`,
    );
  }
  const data: VersionsJson = await res.json();
  if (data.schema_version !== 2) {
    throw new Error(
      `Unsupported versions.json schema_version: ${data.schema_version} (expected 2). ` +
        'Please update your scripts.',
    );
  }
  return data;
}

// ---------------------------------------------------------------------------
// Download & extract
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Download a `.tar.zst` archive, verify its SHA-256 checksum,
 * then decompress (zstd) and extract (tar) into `destDir`.
 *
 * The destination directory is wiped before extraction.
 */
export async function downloadAndExtract(
  url: string,
  destDir: string,
  expectedSha256: string,
): Promise<void> {
  // --- download to temp file ---
  const tmpFile = join(tmpdir(), `moyu-engine-${Date.now()}.tar.zst`);

  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) {
      throw new Error(`Download failed: HTTP ${res.status} ${res.statusText}`);
    }

    const totalBytes = Number(res.headers.get('content-length') ?? 0);
    let downloadedBytes = 0;

    const writer = createWriteStream(tmpFile);
    const reader = res.body.getReader();

    // Stream to disk while tracking progress
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      writer.write(value);
      downloadedBytes += value.byteLength;
      if (totalBytes > 0) {
        const pct = ((downloadedBytes / totalBytes) * 100).toFixed(0);
        process.stdout.write(
          `\r  Downloading… ${formatBytes(downloadedBytes)} / ${formatBytes(totalBytes)} (${pct}%)`,
        );
      } else {
        process.stdout.write(
          `\r  Downloading… ${formatBytes(downloadedBytes)}`,
        );
      }
    }

    await new Promise<void>((resolve, reject) => {
      writer.end(() => resolve());
      writer.on('error', reject);
    });
    process.stdout.write('\n');

    // --- SHA-256 verification ---
    const hash = createHash('sha256');
    await pipeline(createReadStream(tmpFile), hash);
    const actual = hash.digest('hex');
    if (actual !== expectedSha256) {
      throw new Error(
        `SHA-256 mismatch!\n  Expected: ${expectedSha256}\n  Actual:   ${actual}`,
      );
    }
    log.success('Checksum verified.');

    // --- extract: zstd → tar ---
    await rm(destDir, { recursive: true, force: true });
    await mkdir(destDir, { recursive: true });

    const zstdStream = createZstdDecompress();
    const source = createReadStream(tmpFile);

    await pipeline(source, zstdStream, tarExtract({ cwd: destDir }));

    log.success(`Extracted to ${destDir}`);
  } finally {
    // Always clean up the temp file
    await rm(tmpFile, { force: true }).catch(() => {});
  }
}
