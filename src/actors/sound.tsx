import { executePluginCommand, useIsSkipping } from '@momoyu-ink/kit';
import { useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';
import { settingsState } from '../state/settings';

/**
 * SoundActor - Headless actor that manages named channel audio playback.
 *
 * Skip behavior: Sound is not played during skip mode to avoid audio overlap.
 * Auto behavior: Sound plays normally but does not participate in auto waiting.
 */
export function SoundActor() {
  const soundState = useSnapshot(gameState.sound);
  const isSkipping = useIsSkipping();
  // Capture isSkipping in a ref so the play effect only re-runs on seq changes.
  // Same rationale as SfxActor: prevents stale replays when skip ends.
  const isSkippingRef = useRef(false);
  isSkippingRef.current = isSkipping;

  // Handle play requests
  useEffect(() => {
    if (soundState.seq === 0) return;

    // Skip sound during fast-forward to avoid audio overlap
    if (isSkippingRef.current) return;

    const { channel, src, loop, volume, fadeTime } = gameState.sound;
    if (!src || !channel) return;

    try {
      executePluginCommand('audio', {
        subCommand: 'load',
        name: channel,
        src,
        settings: {
          autoPlay: true,
          loopRegion: loop ? [0, -1] : undefined,
          volume: volume ?? settingsState.volume_se,
          fadeTime,
        },
      });
    } catch (err) {
      console.error(`Failed to play sound on channel ${channel}:`, err);
    }
  }, [soundState.seq]);

  // Handle stop requests
  useEffect(() => {
    if (soundState.stopSeq === 0) return;

    const { stopChannel, stopFadeTime } = gameState.sound;
    if (!stopChannel) return;

    try {
      executePluginCommand('audio', {
        subCommand: 'release',
        name: stopChannel,
        fadeTime: stopFadeTime,
      });
    } catch (err) {
      console.error(`Failed to stop sound on channel ${stopChannel}:`, err);
    }
  }, [soundState.stopSeq]);

  // Headless actor — no visual rendering.
  return null;
}
