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

  // biome-ignore lint/correctness/useExhaustiveDependencies: only src should trigger replaying
  useEffect(() => {
    if (!bgmState.src) {
      // Release BGM when src is empty
      try {
        executePluginCommand('audio', {
          subCommand: 'release',
          name: 'bgm',
          fadeTime: bgmState.fadeTime ?? 0,
        });
      } catch (err) {
        console.error('Failed to stop sound on channel bgm:', err);
      }
    } else {
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
  }, [bgmState.src]);

  // release bgm once the actor unmounts
  useEffect(() => {
    return () => {
      // Cleanup: stop and release BGM when actor unmounts
      try {
        executePluginCommand('audio', {
          subCommand: 'release',
          name: 'bgm',
          fadeTime: 300,
        });
      } catch (err) {
        console.error('Failed to stop sound on channel bgm during cleanup:', err);
      }
    };
  }, []);

  // Headless actor - no visual rendering
  return null;
}
