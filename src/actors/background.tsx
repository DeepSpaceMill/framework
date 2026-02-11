import { animated, useSpring, useSpringRef, useTransition, useSkipCallback, useIsSkipping } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';
import { useCallback, useEffect } from 'react';

export function BackgroundActor() {
  const backgroundState = useSnapshot(gameState.background);
  const skipping = useIsSkipping();
  const transRef = useSpringRef();
  const tintSpringRef = useSpringRef();

  const transitions = useTransition(backgroundState.src ? [backgroundState.src] : [], {
    keys: (src) => src,
    ref: transRef,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 1 }, // keep opacity until removed to simulate crossfade
    config: {
      duration: skipping ? 0 : backgroundState.fadeTime,
    },
  });

  // Animate tint changes smoothly using react-spring's built-in color interpolation
  const [tintSpring] = useSpring(
    () => ({
      ref: tintSpringRef,
      tint: backgroundState.tint || '#FFFFFF', // White = no tint effect
      config: {
        duration: skipping ? 0 : backgroundState.fadeTime,
      },
    }),
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: we must recall start on src change
  useEffect(() => {
    transRef.start();
  }, [transRef, backgroundState.src]);

  // Update tint animation when tint changes
  useEffect(() => {
    tintSpringRef.start({
      tint: backgroundState.tint || '#FFFFFF',
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
      {transitions((style, src) => (
        <animated.sprite label="背景图" src={src} opacity={style.opacity} tint={tintSpring.tint as any} />
      ))}
    </container>
  );
}
