import { executePluginCommand, nextLine, useIsSeeking, useSkipCallback } from '@momoyu-ink/kit';
import { useCallback, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

/**
 * BGMActor - A headless actor that manages background music playback.
 *
 * Skip behavior: BGM continues playing during skip (unlike SFX).
 *   When waitForEnd=true and skip fires mid-playback, the hold is released
 *   by the skip system; this actor cancels the pending nextLine callback.
 * waitForEnd behavior: Loads without autoPlay, then plays with waitForEnd=true.
 *   Calls nextLine() when the audio finishes to release the hold() set by the handler.
 */
export function BGMActor() {
  const bgmState = useSnapshot(gameState.bgm);
  const isSeeking = useIsSeeking();

  // Tracks a cancel function for the currently active waitForEnd operation.
  const cancelWaitRef = useRef<(() => void) | null>(null);

  // When skip fires while a waitForEnd BGM is playing, stop the audio so the
  // play promise resolves and the cancelled flag prevents a double nextLine().
  useSkipCallback(
    useCallback(() => {
      cancelWaitRef.current?.();
      cancelWaitRef.current = null;
    }, []),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: only src should trigger replaying
  useEffect(() => {
    const { src, loop, volume, fadeTime, waitForEnd } = gameState.bgm;

    if (!src) {
      // Release BGM when src is empty (bgmStop command).
      try {
        executePluginCommand('audio', {
          subCommand: 'release',
          name: 'bgm',
          fadeTime: fadeTime ?? 0,
        });
      } catch (err) {
        console.error('Failed to stop sound on channel bgm:', err);
      }
      return;
    }

    if (waitForEnd) {
      // Two-step: load without autoPlay, then play with waitForEnd to get a
      // completion promise. Call nextLine() when done to release the hold().
      let cancelled = false;
      cancelWaitRef.current = () => {
        cancelled = true;
        try {
          executePluginCommand('audio', { subCommand: 'release', name: 'bgm', fadeTime: 0 });
        } catch (err) {
          console.error('Failed to stop BGM during cancel:', err);
        }
      };

      void (async () => {
        try {
          await executePluginCommand('audio', {
            subCommand: 'load',
            name: 'bgm',
            src,
            settings: {
              autoPlay: false,
              loopRegion: loop ? [0, -1] : undefined,
              volume,
              fadeTime: fadeTime ?? 0,
            },
          });

          if (cancelled) return;

          await executePluginCommand('audio', {
            subCommand: 'play',
            name: 'bgm',
            fadeTime: fadeTime ?? 0,
            waitForEnd: true,
          });

          if (!cancelled) {
            nextLine();
          }
        } catch (err) {
          console.error('Failed to play BGM with waitForEnd:', err);
          // Advance even on error to avoid a permanent deadlock.
          if (!cancelled) {
            nextLine();
          }
        } finally {
          cancelWaitRef.current = null;
        }
      })();

      return () => {
        cancelled = true;
        cancelWaitRef.current = null;
      };
    }

    // Normal path: load with autoPlay.
    try {
      executePluginCommand('audio', {
        subCommand: 'load',
        name: 'bgm',
        src,
        settings: {
          autoPlay: true,
          loopRegion: loop ? [0, -1] : undefined,
          volume,
          fadeTime: fadeTime ?? 0,
        },
      });
    } catch (err) {
      console.error('Failed to load bgm:', err);
    }
  }, [bgmState.src]);

  // Cancel waitForEnd and release BGM during fast solve (seeking).
  useEffect(() => {
    if (!isSeeking) {
      return;
    }

    cancelWaitRef.current?.();
    cancelWaitRef.current = null;

    try {
      executePluginCommand('audio', {
        subCommand: 'release',
        name: 'bgm',
        fadeTime: gameState.bgm.fadeTime ?? 0,
      });
    } catch (err) {
      console.error('Failed to stop BGM during fast solve:', err);
    }
  }, [isSeeking]);

  // Release BGM once the actor unmounts.
  useEffect(() => {
    return () => {
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
