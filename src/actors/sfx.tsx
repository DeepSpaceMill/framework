import { executePluginCommand, useIsSkipping } from '@momoyu-ink/kit';
import { useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';
import { settingsState } from '../state/settings';

/**
 * SfxActor - Headless actor that manages sound effect playback.
 *
 * Skip behavior: SFX is not played during skip mode to avoid audio overlap.
 * Auto behavior: SFX plays normally but does not participate in auto waiting.
 */
export function SfxActor() {
  const sfxState = useSnapshot(gameState.sfx);
  const isSkipping = useIsSkipping();
  // Capture isSkipping in a ref so the play effect only re-runs on seq changes.
  // Reading isSkipping directly from the ref avoids stale replays when skip ends:
  // if isSkipping were in the dep array, the effect would re-fire after skip ends
  // and replay the last seq that was suppressed during skipping.
  const isSkippingRef = useRef(false);
  isSkippingRef.current = isSkipping;

  // Handle play requests
  useEffect(() => {
    if (sfxState.seq === 0) return;

    // Skip SFX during fast-forward to avoid audio overlap
    if (isSkippingRef.current) return;

    const { src, loop, volume, fadeTime } = gameState.sfx;
    if (!src) return;

    try {
      executePluginCommand('audio', {
        subCommand: 'load',
        name: `sfx_${sfxState.seq}`,
        src,
        settings: {
          autoPlay: true,
          loopRegion: loop ? [0, -1] : undefined,
          volume: volume ?? settingsState.volume_se,
          fadeTime,
        },
      });
    } catch (err) {
      console.error('Failed to play SFX:', err);
    }
  }, [sfxState.seq]);

  // Handle stop requests
  useEffect(() => {
    if (sfxState.stopSeq === 0) return;

    try {
      executePluginCommand('audio', {
        subCommand: 'release',
        name: 'sfx',
        fadeTime: gameState.sfx.stopFadeTime,
      });
    } catch (err) {
      console.error('Failed to stop SFX:', err);
    }
  }, [sfxState.stopSeq]);

  // Headless actor — no visual rendering.
  return null;
}
