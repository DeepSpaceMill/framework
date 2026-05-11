import { executePluginCommand, nextLine, useAutoTicket, useIsSeeking, useSkipCallback, type AutoTicketHandle } from '@momoyu-ink/kit';
import { useCallback, useLayoutEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

/**
 * VoiceActor - Headless actor that manages voice playback and participates in auto mode.
 *
 * When auto mode is active and a new voice starts playing, this actor issues an auto
 * ticket so the barrier waits for voice completion before advancing. The ticket is
 * cancelled if the voice is stopped early or the component unmounts.
 *
 * waitForEnd behavior: When the command sets waitForEnd=true, the handler calls hold()
 * to block the scenario. This actor then calls nextLine() when the audio finishes
 * naturally, releasing the hold. The auto ticket is also issued for compatibility with
 * auto mode (though hold() makes it effectively unused in that path).
 * A cancelled flag prevents a double nextLine() if skip or src-change fires first.
 */
export function VoiceActor() {
  // Subscribe to voice state changes to trigger re-runs of the layout effect.
  const voiceState = useSnapshot(gameState.voice);
  const isSeeking = useIsSeeking();
  const issueAutoTicket = useAutoTicket();
  const autoTicketRef = useRef<AutoTicketHandle | null>(null);
  const isSeekingRef = useRef(false);
  isSeekingRef.current = isSeeking;

  // Tracks whether the current async playback has been cancelled.
  // Used to guard against a double nextLine() when skip or src-change fires
  // while a waitForEnd playback is in progress.
  const cancelledRef = useRef(false);

  // Cancel function for the current waitForEnd operation: stops the audio so
  // the play promise resolves, then the cancelled flag prevents nextLine().
  const cancelWaitRef = useRef<(() => void) | null>(null);

  // When skip fires while a waitForEnd voice is playing, stop the audio.
  // The hold() will be released by the skip system's scheduleSkipNextLine.
  useSkipCallback(
    useCallback(() => {
      cancelWaitRef.current?.();
      cancelWaitRef.current = null;
    }, []),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: issueAutoTicket is a stable ref
  useLayoutEffect(() => {
    // Read directly from proxy to avoid snapshot staleness inside async closures.
    const { src, channel: channelName, volume, waitForEnd } = gameState.voice;

    // Cancel any ticket from the previous voice (effect cleanup may have already done
    // this, but guard against the case where src changed before cleanup ran).
    autoTicketRef.current?.cancel();
    autoTicketRef.current = null;
    cancelledRef.current = true;
    cancelWaitRef.current = null;

    if (isSeekingRef.current) {
      if (channelName) {
        try {
          executePluginCommand('audio', { subCommand: 'release', name: channelName });
        } catch (err) {
          console.error('Failed to release voice channel during fast solve:', err);
        }
      }
      return;
    }

    if (!src) {
      // Voice was cleared (voiceStop command) — release the channel.
      try {
        executePluginCommand('audio', { subCommand: 'release', name: channelName });
      } catch (err) {
        console.error('Failed to release voice channel:', err);
      }
      return;
    }

    // Reset the cancelled flag for this new playback session.
    cancelledRef.current = false;

    if (waitForEnd) {
      // Register a cancel function that stops audio so the play promise resolves.
      cancelWaitRef.current = () => {
        cancelledRef.current = true;
        try {
          executePluginCommand('audio', { subCommand: 'release', name: channelName });
        } catch (err) {
          console.error('Failed to release voice channel during cancel:', err);
        }
      };
    }

    // Issue an auto ticket before starting async work. issueAutoTicket returns null
    // when auto mode is inactive or the collection window has already closed, so no
    // conditional check is needed here.
    const ticket = issueAutoTicket({ label: `voice:${channelName}` });
    autoTicketRef.current = ticket;

    void (async () => {
      try {
        // Load without autoPlay so Play can supply the end-of-playback callback.
        await executePluginCommand('audio', {
          subCommand: 'load',
          name: channelName,
          src,
          settings: {
            autoPlay: false,
            volume,
          },
        });

        if (cancelledRef.current) {
          ticket?.cancel();
          return;
        }

        // Play and await natural completion via the wait_for_end promise.
        await executePluginCommand('audio', {
          subCommand: 'play',
          name: channelName,
          fadeTime: 0,
          waitForEnd: true,
        });

        ticket?.done();

        // Release the scenario hold() set by the handler when waitForEnd=true.
        if (waitForEnd && !cancelledRef.current) {
          nextLine();
        }
      } catch (err) {
        console.error('Failed to play voice:', err);
        ticket?.cancel();
        // Advance even on error to avoid a permanent deadlock.
        if (waitForEnd && !cancelledRef.current) {
          nextLine();
        }
      }

      autoTicketRef.current = null;
      cancelWaitRef.current = null;
    })();

    return () => {
      // Cancel the ticket on cleanup (src changed or component unmounts).
      // Also mark cancelled so the async path won't call nextLine().
      cancelledRef.current = true;
      cancelWaitRef.current = null;
      autoTicketRef.current?.cancel();
      autoTicketRef.current = null;
    };
  }, [voiceState.src, voiceState.channel]);

  useLayoutEffect(() => {
    if (!isSeeking) {
      return;
    }

    const channelName = gameState.voice.channel;

    cancelledRef.current = true;
    cancelWaitRef.current = null;
    autoTicketRef.current?.cancel();
    autoTicketRef.current = null;

    if (!channelName) {
      return;
    }

    try {
      executePluginCommand('audio', { subCommand: 'release', name: channelName });
    } catch (err) {
      console.error('Failed to release voice channel during fast solve:', err);
    }
  }, [isSeeking]);

  // Headless actor — no visual rendering.
  return null;
}

