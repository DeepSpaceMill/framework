import { animated, useTransition } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

export function BackgroundActor() {
  const backgroundState = useSnapshot(gameState.background);

  const transitions = useTransition(backgroundState.src ? [backgroundState.src] : [], {
    keys: (src) => src,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: backgroundState.fadeTime,
    },
  });

  return (
    <container label="背景容器">
      {transitions((style, src) => (
        <animated.sprite label="背景图" src={src} opacity={style.opacity} />
      ))}
    </container>
  );
}
