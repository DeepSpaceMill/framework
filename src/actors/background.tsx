import { useSpring, useSpringRef, useSkipCallback, useIsSeeking, useIsSkipping } from '@momoyu-ink/kit';
import { useCallback, useEffect } from 'react';
import { useGameStateSection } from '../state/game';
import { Sprite } from '../components/sprite';

const EMPTY_BACKGROUND_KEY = '__background-empty__';

export function BackgroundActor() {
  const backgroundState = useGameStateSection('background');
  const skipping = useIsSkipping();
  const seeking = useIsSeeking();
  const shouldSkipVisuals = skipping || seeking;
  const transitionKey = backgroundState.src || EMPTY_BACKGROUND_KEY;
  const tintSpringRef = useSpringRef();

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

    // Check and finish tint transition
    const currentTint = tintSpringRef.current[0]?.get().tint;
    const targetTint = backgroundState.tint || '#FFFFFF';
    if (currentTint !== targetTint) {
      tintSpringRef.set({ tint: targetTint });
      finished = true;
    }

    return finished;
  }, [tintSpringRef, backgroundState.tint]);

  // Register skip callback so waiting-cancelled events finish the transition
  useSkipCallback(tryFinish);

  return (
    <Sprite
      label="背景"
      src={backgroundState.src}
      autoPlay={true}
      loop={true}
      muted={true}
      tint={tintSpring.tint as any}
      transition={{
        label: '背景转场容器',
        transitionKey: transitionKey,
        retain: 'static',
        performKey: `${transitionKey}:${shouldSkipVisuals ? 'skip' : 'run'}`,
        effect: backgroundState.transitionEffect,
        duration: shouldSkipVisuals ? 0 : backgroundState.fadeTime,
      }}
    />
  );
}
