import { animated, useSpringRef, useTransition } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';
import { forwardRef, useEffect, useImperativeHandle } from 'react';

export interface BackgroundHandle {
  tryFinish: () => void;
}

export const BackgroundActor = forwardRef<BackgroundHandle>((_, ref) => {
  const backgroundState = useSnapshot(gameState.background);
  const transRef = useSpringRef();

  const transitions = useTransition(backgroundState.src ? [backgroundState.src] : [], {
    keys: (src) => src,
    ref: transRef,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: backgroundState.fadeTime,
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: we must recall start on src change
  useEffect(() => {
    transRef.start();
  }, [transRef, backgroundState.src]);

  // try to finish the transition immediately
  const tryFinish = () => {
    const currentOpacity = transRef.current[0]?.get().opacity;
    if (currentOpacity < 1) {
      // Stop all ongoing animations and jump to the final state
      transRef.set({ opacity: 1 });
      return true;
    }
    return false;
  };

  useImperativeHandle(ref, () => ({
    tryFinish,
  }));

  return (
    <container label="背景容器">
      {transitions((style, src) => (
        <animated.sprite label="背景图" src={src} opacity={style.opacity} />
      ))}
    </container>
  );
});
