import { executePluginCommand, useIsSkipping } from '@momoyu-ink/kit';
import { useEffect } from 'react';
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

  // Handle play requests
  useEffect(() => {
    if (sfxState.seq === 0) return;

    // Skip SFX during fast-forward to avoid audio overlap
    if (isSkipping) return;

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
  }, [sfxState.seq, isSkipping]);

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
