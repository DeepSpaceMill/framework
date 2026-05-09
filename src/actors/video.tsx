import {
  animated,
  type Command,
  getStageSize,
  nextLine,
  Node,
  useAutoBlocker,
  useIsSeeking,
  useInterruptCallback,
  useSkipBlocker,
  useTransition,
} from '@momoyu-ink/kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';
import { uiActions } from '../state/ui';

/**
 * Fullscreen video actor.
 *
 * Visibility lifecycle:
 *   1. handler sets gameState.video.visible=true and calls control.hold().
 *   2. local `showing` flips on, useTransition runs the enter animation.
 *   3. video plays. When it ends naturally OR the user confirms a skip,
 *      `finish()` toggles `showing` off (starts leave animation) and queues
 *      a timer to clear gameState.video.visible and call nextLine() once
 *      the leave animation completes.
 *
 * gameState.video.visible stays true throughout the leave animation so that
 * skip / auto blockers and the interrupt callback keep swallowing user
 * input until the scenario actually advances.
 */
export function VideoActor() {
  const videoSnap = useSnapshot(gameState.video);
  const seeking = useIsSeeking();
  const stageSize = getStageSize();

  const videoRef = useRef<Node>(null);
  // Local mirror of "should the video element be in the tree". Driven from
  // gameState.video.visible on entry, but cleared earlier than visible on
  // finish so that useTransition can play the leave animation while the
  // outer state still blocks input.
  const [showing, setShowing] = useState(false);
  // Guards against double-finish (e.g. onEnded firing during a confirm flow).
  const finishingRef = useRef(false);
  // Pending timer that finalizes state and advances the scenario after the
  // leave animation completes. Cleaned up on unmount.
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync `showing` from valtio state when a new video is requested.
  useEffect(() => {
    if (videoSnap.visible && !showing && !finishingRef.current && !seeking) {
      setShowing(true);
    }
  }, [videoSnap.visible, showing, seeking]);

  // Block skip and auto modes while the video is active. handler's
  // control.hold() consults these on dispatch and stops the active mode.
  const isVideoActive = useCallback(() => gameState.video.visible, []);
  useSkipBlocker(isVideoActive);
  useAutoBlocker(isVideoActive);

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setShowing(false);
    const fadeMs = gameState.video.fadeTime;
    finishTimerRef.current = setTimeout(() => {
      finishTimerRef.current = null;
      finishingRef.current = false;
      gameState.video.visible = false;
      gameState.video.src = '';
      void nextLine();
    }, fadeMs);
  }, []);

  // Consume click attempts while the video is on screen. Returns true to
  // signal Stage's tryInterrupt() that the click was handled.
  const handleInterrupt = useCallback((): boolean => {
    if (!gameState.video.visible) return false;
    // Already in the leave-out tail — swallow without prompting again.
    if (finishingRef.current) return true;
    if (!gameState.video.skippable) return true;

    // Pause the video while the confirm dialog is up. The video node
    // accepts {subCommand: 'pause' | 'resume'} but kit's Command type is
    // limited to plugin-level commands, so cast through unknown.
    videoRef.current?.executeCommand({ subCommand: 'pause' } as unknown as Command);
    uiActions.confirm(
      '是否跳过当前视频？',
      () => {
        finish();
      },
      () => {
        videoRef.current?.executeCommand({ subCommand: 'resume' } as unknown as Command);
      },
    );
    return true;
  }, [finish]);
  useInterruptCallback(handleInterrupt);

  // Cancel any pending finalize timer if the actor unmounts mid fade-out.
  useEffect(() => {
    return () => {
      if (finishTimerRef.current !== null) {
        clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }
    };
  }, []);

  const transitions = useTransition(!seeking && showing ? [videoSnap.src] : [], {
    keys: (src) => src,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: videoSnap.fadeTime },
  });

  return transitions((style, src) => (
    <animated.container
      label="视频层"
      x={stageSize.width / 2}
      y={stageSize.height / 2}
      scale={stageSize.height / 1080}
      opacity={style.opacity}
    >
      {/* Black backdrop so any letterboxed area outside the video is opaque. */}
      <sprite label="视频遮罩" src="ui/mask.png" pivot={[0.5, 0.5]} anchor={[0.5, 0.5]} />
      <video
        ref={videoRef}
        label="视频"
        src={src}
        autoPlay={true}
        loop={false}
        anchor={[0.5, 0.5]}
        pivot={[0.5, 0.5]}
        onEnded={finish}
      />
    </animated.container>
  ));
}
