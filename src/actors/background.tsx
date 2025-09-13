import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

export function BackgroundActor() {
  const backgroundState = useSnapshot(gameState.background);

  if (!backgroundState.src) {
    return null;
  }

  return <sprite label="背景图" src={backgroundState.src} />;
}
