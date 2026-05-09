import { animated, useSpring, useSpringRef, useTransition, useSkipCallback, useIsSeeking, useIsSkipping } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';
import { useCallback, useEffect } from 'react';

// File extensions treated as looping background video instead of static image.
const VIDEO_EXTENSIONS = ['.mp4', '.webm'];

function isVideoSrc(src: string): boolean {
  const lower = src.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function BackgroundActor() {
  const backgroundState = useSnapshot(gameState.background);
  const skipping = useIsSkipping();
  const seeking = useIsSeeking();
  const shouldSkipVisuals = skipping || seeking;
  const transRef = useSpringRef();
  const tintSpringRef = useSpringRef();

  const transitions = useTransition(backgroundState.src ? [backgroundState.src] : [], {
    keys: (src) => src,
    ref: transRef,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 1 }, // keep opacity until removed to simulate crossfade
    config: {
      duration: shouldSkipVisuals ? 0 : backgroundState.fadeTime,
    },
  });

  // Animate tint changes smoothly using react-spring's built-in color interpolation
  const [tintSpring] = useSpring(
    () => ({
      ref: tintSpringRef,
      tint: backgroundState.tint || '#FFFFFF', // White = no tint effect
      config: {
        duration: shouldSkipVisuals ? 0 : backgroundState.fadeTime,
      },
    }),
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: we must recall start on src change
  useEffect(() => {
    transRef.start();
  }, [transRef, backgroundState.src]);

  // Update tint animation when tint changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: fadeTime and skipping are read at trigger time, only tint change should re-trigger
  useEffect(() => {
    tintSpringRef.start({
      tint: backgroundState.tint || '#FFFFFF',
      config: {
        duration: shouldSkipVisuals ? 0 : backgroundState.fadeTime,
      },
    });
  }, [tintSpringRef, backgroundState.tint]);

  // try to finish the transition immediately
  const tryFinish = useCallback(() => {
    let finished = false;

    // Check and finish opacity transition
    const currentOpacity = transRef.current[0]?.get().opacity;
    if (currentOpacity < 1) {
      transRef.set({ opacity: 1 });
      finished = true;
    }

    // Check and finish tint transition
    const currentTint = tintSpringRef.current[0]?.get().tint;
    const targetTint = backgroundState.tint || '#FFFFFF';
    if (currentTint !== targetTint) {
      tintSpringRef.set({ tint: targetTint });
      finished = true;
    }

    return finished;
  }, [transRef, tintSpringRef, backgroundState.tint]);

  // Register skip callback so waiting-cancelled events finish the transition
  useSkipCallback(tryFinish);

  return (
    <container label="背景容器">
      {transitions((style, src) =>
        isVideoSrc(src) ? (
          <animated.video
            label="背景视频"
            src={src}
            autoPlay={true}
            loop={true}
            muted={true}
            opacity={style.opacity}
            tint={tintSpring.tint as any}
          />
        ) : (
          <animated.sprite label="背景图" src={src} opacity={style.opacity} tint={tintSpring.tint as any} />
        ),
      )}
    </container>
  );
}
