import { executePluginCommand, nextLine, useIsSeeking, useIsSkipping, useSkipCallback } from '@momoyu-ink/kit';
import { useCallback, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

/**
 * SfxActor - Headless actor that manages sound effect playback.
 *
 * Skip behavior: SFX is not played during skip mode to avoid audio overlap.
 *   When waitForEnd=true and skip fires mid-playback, the audio is stopped and
 *   the pending nextLine call is cancelled (the skip system releases the hold).
 * Auto behavior: SFX plays normally but does not participate in auto waiting.
 * waitForEnd behavior: Loads without autoPlay, then plays with waitForEnd=true.
 *   Calls nextLine() when the audio finishes to release the hold() set by the handler.
 */
export function SfxActor() {
  const sfxState = useSnapshot(gameState.sfx);
  const isSkipping = useIsSkipping();
  const isSeeking = useIsSeeking();
  // Capture isSkipping in a ref so the play effect only re-runs on seq changes.
  // Reading isSkipping directly from the ref avoids stale replays when skip ends:
  // if isSkipping were in the dep array, the effect would re-fire after skip ends
  // and replay the last seq that was suppressed during skipping.
  const isSkippingRef = useRef(false);
  isSkippingRef.current = isSkipping;
  const isSeekingRef = useRef(false);
  isSeekingRef.current = isSeeking;

  // Tracks a cancel function for the currently active waitForEnd operation.
  // Set by the play effect and called by the skip callback.
  const cancelWaitRef = useRef<(() => void) | null>(null);

  // When skip fires while a waitForEnd SFX is playing, stop the audio.
  // The hold() will be released by the skip system's scheduleSkipNextLine.
  useSkipCallback(
    useCallback(() => {
      cancelWaitRef.current?.();
      cancelWaitRef.current = null;
    }, []),
  );

  // Handle play requests
  useEffect(() => {
    if (sfxState.seq === 0) return;

    // Skip SFX during fast-forward to avoid audio overlap
    if (isSkippingRef.current || isSeekingRef.current) return;

    const { src, loop, volume, fadeTime, waitForEnd } = gameState.sfx;
    if (!src) return;

    if (waitForEnd) {
      // Two-step: load without autoPlay, then play with waitForEnd to get a
      // completion promise. Call nextLine() when done to release the hold().
      let cancelled = false;
      cancelWaitRef.current = () => {
        cancelled = true;
        try {
          executePluginCommand('audio', { subCommand: 'release', name: 'sfx', fadeTime: 0 });
        } catch (err) {
          console.error('Failed to stop SFX during cancel:', err);
        }
      };

      void (async () => {
        try {
          await executePluginCommand('audio', {
            subCommand: 'load',
            name: 'sfx',
            src,
            settings: {
              autoPlay: false,
              loopRegion: loop ? [0, -1] : undefined,
              volume,
              fadeTime,
            },
          });

          if (cancelled) return;

          await executePluginCommand('audio', {
            subCommand: 'play',
            name: 'sfx',
            fadeTime,
            waitForEnd: true,
          });

          if (!cancelled) {
            nextLine();
          }
        } catch (err) {
          console.error('Failed to play SFX with waitForEnd:', err);
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

    // Normal (non-waitForEnd) path: load with autoPlay.
    try {
      executePluginCommand('audio', {
        subCommand: 'load',
        name: 'sfx',
        src,
        settings: {
          autoPlay: true,
          loopRegion: loop ? [0, -1] : undefined,
          volume,
          fadeTime,
        },
      });
    } catch (err) {
      console.error('Failed to play SFX:', err);
    }
  }, [sfxState.seq]);

  useEffect(() => {
    if (!isSeeking) {
      return;
    }

    // Cancel any pending waitForEnd operation during fast solve.
    cancelWaitRef.current?.();
    cancelWaitRef.current = null;

    try {
      executePluginCommand('audio', {
        subCommand: 'release',
        name: 'sfx',
        fadeTime: gameState.sfx.stopFadeTime ?? 0,
      });
    } catch (err) {
      console.error('Failed to stop SFX during fast solve:', err);
    }
  }, [isSeeking]);

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

  // Stop all SFX when the actor unmounts
  useEffect(() => {
    return () => {
      try {
        executePluginCommand('audio', {
          subCommand: 'release',
          name: 'sfx',
          fadeTime: 300,
        });
      } catch (err) {
        console.error('Failed to stop SFX:', err);
      }
    };
  }, []);

  // Headless actor — no visual rendering.
  return null;
}
