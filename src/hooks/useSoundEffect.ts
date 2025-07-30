import { executePluginCommand } from '@momoyu-ink/kit';
import { useEffect } from 'react';

// avoid loading or releasing the same sound effect multiple times
const LOADED_SOUNDS = new Set<string>();

/**
 * Used to load a sound effect and provide a function to play it.
 */
export function useSoundEffect(src: string) {
  useEffect(() => {
    // Load the sound effect when the component mounts
    const loadSound = async () => {
      try {
        await executePluginCommand('audio', {
          subCommand: 'load',
          name: src,
          src,
        });
      } catch (error) {
        console.error(`Failed to load sound effect ${src}:`, error);
      }
      LOADED_SOUNDS.add(src);
    };

    let needRelease = false;

    if (!LOADED_SOUNDS.has(src)) {
      loadSound();
      needRelease = true;
    }

    // Cleanup function to unload the sound effect when the component unmounts
    return () => {
      const releaseSound = async () => {
        try {
          await executePluginCommand('audio', {
            subCommand: 'release',
            name: src,
          });
        } catch (error) {
          console.error(`Failed to release sound effect ${src}:`, error);
        }
        LOADED_SOUNDS.delete(src);
      };
      if (needRelease) {
        releaseSound();
      }
    };
  }, [src]);

  // Function to play the sound effect
  return () => {
    executePluginCommand('audio', {
      subCommand: 'play',
      name: src,
    });
  };
}
