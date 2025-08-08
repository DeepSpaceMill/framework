import { addEventListener } from '@momoyu-ink/kit';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { type BackgroundState, backgroundAtom } from '../atoms';

export function useBackground() {
  const [backgroundState, setBackgroundState] = useAtom(backgroundAtom);

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
    setBackgroundState((prev) => ({
      ...prev,
      src,
      ...options,
    }));
  };

  return {
    backgroundState,
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
