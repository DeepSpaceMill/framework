import { executePluginCommand } from '@momoyu-ink/kit';
import { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

/**
 * BGMActor - A headless actor that manages background music playback
 * Returns null as it doesn't render any visual elements
 */
export function BGMActor() {
  const bgmState = useSnapshot(gameState.bgm);

  useEffect(() => {
    if (bgmState.src) {
      // Load and play BGM when src is set
      try {
        executePluginCommand('audio', {
          subCommand: 'load',
          name: 'bgm',
          src: bgmState.src,
          settings: {
            autoPlay: true,
            loopRegion: bgmState.loop ? [0, -1] : undefined,
            volume: bgmState.volume,
            fadeTime: bgmState.fadeTime ?? 0,
          },
        });
      } catch (err) {
        console.error('Failed to load bgm:', err);
      }
    }

    return () => {
      // Cleanup: stop and release BGM when actor unmounts
      try {
        executePluginCommand('audio', {
          subCommand: 'release',
          name: 'bgm',
          fadeTime: bgmState.fadeTime ?? 0,
        });
      } catch (err) {
        console.error('Failed to stop sound on channel bgm during cleanup:', err);
      }
    };
  }, [bgmState.src, bgmState.loop, bgmState.volume, bgmState.fadeTime]);

  // Headless actor - no visual rendering
  return null;
}
