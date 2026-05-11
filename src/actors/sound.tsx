import { executePluginCommand, nextLine, useIsSeeking, useIsSkipping, useSkipCallback } from '@momoyu-ink/kit';
import { useCallback, useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

/**
 * SoundActor - Headless actor that manages named channel audio playback.
 *
 * Skip behavior: Sound is not played during skip mode to avoid audio overlap.
 *   When waitForEnd=true and skip fires mid-playback, the audio is stopped and
 *   the pending nextLine call is cancelled (the skip system releases the hold).
 * Auto behavior: Sound plays normally but does not participate in auto waiting.
 * waitForEnd behavior: Loads without autoPlay, then plays with waitForEnd=true.
 *   Calls nextLine() when the audio finishes to release the hold() set by the handler.
 */
export function SoundActor() {
  const soundState = useSnapshot(gameState.sound);
  const isSkipping = useIsSkipping();
  const isSeeking = useIsSeeking();
  // Capture isSkipping in a ref so the play effect only re-runs on seq changes.
  // Same rationale as SfxActor: prevents stale replays when skip ends.
  const isSkippingRef = useRef(false);
  isSkippingRef.current = isSkipping;
  const isSeekingRef = useRef(false);
  isSeekingRef.current = isSeeking;

  // Tracks a cancel function for the currently active waitForEnd operation.
  const cancelWaitRef = useRef<(() => void) | null>(null);

  // When skip fires while a waitForEnd sound is playing, stop the audio.
  // The hold() will be released by the skip system's scheduleSkipNextLine.
  useSkipCallback(
    useCallback(() => {
      cancelWaitRef.current?.();
      cancelWaitRef.current = null;
    }, []),
  );

  // Handle play requests
  useEffect(() => {
    if (soundState.seq === 0) return;

    // Skip sound during fast-forward to avoid audio overlap
    if (isSkippingRef.current || isSeekingRef.current) return;

    const { channel, src, loop, volume, fadeTime, waitForEnd } = gameState.sound;
    if (!src || !channel) return;

    if (waitForEnd) {
      // Two-step: load without autoPlay, then play with waitForEnd to get a
      // completion promise. Call nextLine() when done to release the hold().
      let cancelled = false;
      cancelWaitRef.current = () => {
        cancelled = true;
        try {
          executePluginCommand('audio', { subCommand: 'release', name: channel, fadeTime: 0 });
        } catch (err) {
          console.error(`Failed to stop sound on channel ${channel} during cancel:`, err);
        }
      };

      void (async () => {
        try {
          await executePluginCommand('audio', {
            subCommand: 'load',
            name: channel,
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
            name: channel,
            fadeTime,
            waitForEnd: true,
          });

          if (!cancelled) {
            nextLine();
          }
        } catch (err) {
          console.error(`Failed to play sound on channel ${channel} with waitForEnd:`, err);
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
        name: channel,
        src,
        settings: {
          autoPlay: true,
          loopRegion: loop ? [0, -1] : undefined,
          volume,
          fadeTime,
        },
      });
    } catch (err) {
      console.error(`Failed to play sound on channel ${channel}:`, err);
    }
  }, [soundState.seq]);

  useEffect(() => {
    if (!isSeeking) {
      return;
    }

    // Cancel any pending waitForEnd operation during fast solve.
    cancelWaitRef.current?.();
    cancelWaitRef.current = null;

    const channel = gameState.sound.channel || gameState.sound.stopChannel;
    if (!channel) {
      return;
    }

    try {
      executePluginCommand('audio', {
        subCommand: 'release',
        name: channel,
        fadeTime: gameState.sound.stopFadeTime ?? 0,
      });
    } catch (err) {
      console.error(`Failed to stop sound on channel ${channel} during fast solve:`, err);
    }
  }, [isSeeking]);

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

