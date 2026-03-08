/**
 * Engine download & update script.
 *
 * Downloads the Moyu engine binary (native) and web release package
 * from CDN, verifies integrity, and extracts them to `.moyu/engine/`.
 *
 * Usage:
 *   yarn engine:update
 *   node --experimental-default-type=module scripts/engine-update.ts
 */

import {
  type Meta,
  NATIVE_DIR,
  WEB_DIR,
  detectPlatform,
  downloadAndExtract,
  fetchVersionsJson,
  loadConfig,
  loadMeta,
  log,
  saveMeta,
} from './lib/engine-utils.ts';

async function main() {
  // 1. Read config
  const config = loadConfig();
  log.info(`CDN: ${config.cdnUrl}`);
  log.info(`Channel: ${config.channel}`);

  // 2. Fetch remote version manifest
  log.info('Fetching version manifest…');
  const versions = await fetchVersionsJson(config.cdnUrl);

  // 3. Resolve channel
  const channel = versions.channels[config.channel];
  if (!channel) {
    const available = Object.keys(versions.channels).join(', ');
    throw new Error(
      `Channel "${config.channel}" not found. Available channels: ${available}`,
    );
  }

  // 4. Determine target version
  const targetVersion = config.version ?? channel.latest;
  log.info(`Target version: ${targetVersion}`);

  const entry = channel.versions[targetVersion];
  if (!entry) {
    const available = Object.keys(channel.versions).join(', ');
    throw new Error(
      `Version "${targetVersion}" not found in channel "${config.channel}".\n` +
        `Available versions: ${available}`,
    );
  }

  // 5. Detect native platform
  const platform = detectPlatform();
  log.info(`Detected platform: ${platform}`);

  const nativeAsset = entry.assets[platform];
  if (!nativeAsset) {
    const supported = Object.keys(entry.assets)
      .filter((k) => k !== 'web-universal')
      .join(', ');
    throw new Error(
      `No native asset for platform "${platform}".\n` +
        `Available platforms: ${supported}`,
    );
  }

  const webAsset = entry.assets['web-universal'] ?? null;
  if (!webAsset) {
    log.warn('No web-universal asset available for this version.');
  }

  // 6. Check if already up to date
  const meta = await loadMeta();
  if (meta) {
    const nativeMatch = meta.native?.sha256 === nativeAsset.sha256;
    const webMatch =
      !webAsset || (meta.web && meta.web.sha256 === webAsset.sha256);

    if (meta.version === targetVersion && nativeMatch && webMatch) {
      log.success(
        `Engine is already up to date (${targetVersion}). Nothing to download.`,
      );
      return;
    }
    log.info(
      `Updating engine: ${meta.version} → ${targetVersion}`,
    );
  }

  // 7. Download & extract (native + web in parallel when both available)
  const tasks: Promise<void>[] = [];

  log.info(`Downloading native engine (${platform})…`);
  tasks.push(
    downloadAndExtract(nativeAsset.url, NATIVE_DIR, nativeAsset.sha256),
  );

  if (webAsset) {
    log.info('Downloading web engine…');
    tasks.push(
      downloadAndExtract(webAsset.url, WEB_DIR, webAsset.sha256),
    );
  }

  await Promise.all(tasks);

  // 8. Save metadata
  const newMeta: Meta = {
    version: targetVersion,
    channel: config.channel,
    publishedAt: entry.published_at,
    native: {
      platform,
      url: nativeAsset.url,
      sha256: nativeAsset.sha256,
    },
    web: webAsset
      ? {
          url: webAsset.url,
          sha256: webAsset.sha256,
        }
      : null,
    downloadedAt: new Date().toISOString(),
  };
  await saveMeta(newMeta);

  // 9. Done
  log.success(`Engine ${targetVersion} installed successfully!`);
  log.info(`  Native: ${NATIVE_DIR}`);
  if (webAsset) {
    log.info(`  Web:    ${WEB_DIR}`);
  }
}

main().catch((err: Error) => {
  log.error(err.message);
  process.exit(1);
});
