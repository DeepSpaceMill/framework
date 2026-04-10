import { executePluginCommand } from '@momoyu-ink/kit';
import { snapshot } from 'valtio';
import { gameState, type GameState } from '../state/game';

export function writeCurrentGameStateToScenario(): GameState {
  const currentGameState = snapshot(gameState);

  void executePluginCommand('scenario', {
    subCommand: 'setVariables',
    variables: {
      gameState: currentGameState as any,
    },
  });

  return currentGameState as GameState;
}

export async function restoreGameStateFromScenario(): Promise<GameState | undefined> {
  const loadedGameState = (await executePluginCommand('scenario', {
    subCommand: 'getVariable',
    name: 'gameState',
  })) as GameState | undefined;

  if (!loadedGameState) {
    return undefined;
  }

  for (const key in loadedGameState) {
    if (Object.hasOwn(loadedGameState, key)) {
      Object.assign(gameState[key as keyof GameState], loadedGameState[key as keyof GameState]);
    }
  }

  return loadedGameState;
}
