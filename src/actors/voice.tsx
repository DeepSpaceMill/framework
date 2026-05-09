import { executePluginCommand, useAutoTicket, useIsSeeking, type AutoTicketHandle } from '@momoyu-ink/kit';
import { useLayoutEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

/**
 * VoiceActor - Headless actor that manages voice playback and participates in auto mode.
 *
 * When auto mode is active and a new voice starts playing, this actor issues an auto
 * ticket so the barrier waits for voice completion before advancing. The ticket is
 * cancelled if the voice is stopped early or the component unmounts.
 */
export function VoiceActor() {
  // Subscribe to voice state changes to trigger re-runs of the layout effect.
  const voiceState = useSnapshot(gameState.voice);
  const isSeeking = useIsSeeking();
  const issueAutoTicket = useAutoTicket();
  const autoTicketRef = useRef<AutoTicketHandle | null>(null);
  const isSeekingRef = useRef(false);
  isSeekingRef.current = isSeeking;

  // biome-ignore lint/correctness/useExhaustiveDependencies: issueAutoTicket is a stable ref
  useLayoutEffect(() => {
    // Read directly from proxy to avoid snapshot staleness inside async closures.
    const { src, channel: channelName, volume } = gameState.voice;

    // Cancel any ticket from the previous voice (effect cleanup may have already done
    // this, but guard against the case where src changed before cleanup ran).
    autoTicketRef.current?.cancel();
    autoTicketRef.current = null;

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

        // Play and await natural completion via the wait_for_end promise.
        await executePluginCommand('audio', {
          subCommand: 'play',
          name: channelName,
          fadeTime: 0,
          waitForEnd: true,
        });

        ticket?.done();
      } catch (err) {
        console.error('Failed to play voice:', err);
        ticket?.cancel();
      }

      autoTicketRef.current = null;
    })();

    return () => {
      // Cancel the ticket on cleanup (src changed or component unmounts).
      autoTicketRef.current?.cancel();
      autoTicketRef.current = null;
    };
  }, [voiceState.src, voiceState.channel]);

  useLayoutEffect(() => {
    if (!isSeeking) {
      return;
    }

    const channelName = gameState.voice.channel;
    if (!channelName) {
      return;
    }

    autoTicketRef.current?.cancel();
    autoTicketRef.current = null;

    try {
      executePluginCommand('audio', { subCommand: 'release', name: channelName });
    } catch (err) {
      console.error('Failed to release voice channel during fast solve:', err);
    }
  }, [isSeeking]);

  // Headless actor — no visual rendering.
  return null;
}
