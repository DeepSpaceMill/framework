import { executePluginCommand } from '@momoyu-ink/kit';
import { useEffect } from 'react';

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
    };

    loadSound();

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
      };
      releaseSound();
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
