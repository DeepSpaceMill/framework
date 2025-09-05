import { addEventListener } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import { type BackgroundState, gameState } from '../state/game';

export function useBackground() {
  const snap = useSnapshot(gameState);

  useEffect(() => {
    return addEventListener('scenarionextline', (e) => {
      if (e.type === 'commandline') {
        // Handle background commands
        // Example: bg classroom1.png fade 1000
        // This will be implemented when command definitions are available
      }
    });
  }, []);

  const setBackground = (src: string, options?: Partial<BackgroundState>) => {
    gameState.background.src = src;
    if (options) {
      Object.assign(gameState.background, options);
    }
  };

  return {
    backgroundState: snap.background,
    setBackground,
  };
}

interface BackgroundActorProps {
  backgroundState: BackgroundState;
}

export function BackgroundActor({ backgroundState }: BackgroundActorProps) {
  return (
    <sprite
      label="背景图"
      src={backgroundState.src}
      scale={backgroundState.scale}
      opacity={backgroundState.opacity}
      visible={backgroundState.visible}
    />
  );
}
