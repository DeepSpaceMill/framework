import { useState, useEffect } from 'react';
import { addEventListener } from '@momoyu-ink/kit';

interface BackgroundState {
  src: string;
  scale?: number;
  opacity?: number;
  visible?: boolean;
}

export function useBackground() {
  const [backgroundState, setBackgroundState] = useState<BackgroundState>({
    src: 'non-free/classroom1.png',
    scale: 1920 / 1344,
    opacity: 1,
    visible: true,
  });

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
