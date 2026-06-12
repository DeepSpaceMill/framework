import { useIsSeeking, useIsSkipping } from '@momoyu-ink/kit';
import { useCallback, type ReactNode } from 'react';
import { gameState, useGameStateSection } from '../state/game';
import { TransitionBoundary } from './transitionBoundary';

interface SceneTransitionBoundaryProps {
  children: ReactNode;
}

export function SceneTransitionBoundary({ children }: SceneTransitionBoundaryProps) {
  const sceneTransition = useGameStateSection('sceneTransition');
  const skipping = useIsSkipping();
  const seeking = useIsSeeking();
  const shouldSkipVisuals = skipping || seeking;

  const handleFinished = useCallback(() => {
    if (gameState.sceneTransition.phase !== 'performing') {
      return;
    }

    gameState.sceneTransition.phase = 'stable';
    gameState.sceneTransition.retain = 'static';
  }, []);

  return (
    <TransitionBoundary
      label="场景转场容器"
      transitionKey={`scene:${sceneTransition.key}`}
      retain={sceneTransition.retain}
      performKey={`${sceneTransition.performKey}:${shouldSkipVisuals ? 'skip' : 'run'}`}
      effect={sceneTransition.phase === 'performing' ? sceneTransition.effect : undefined}
      duration={sceneTransition.phase === 'performing' ? (shouldSkipVisuals ? 0 : sceneTransition.fadeTime) : undefined}
      onFinished={handleFinished}
    >
      {children}
    </TransitionBoundary>
  );
}
