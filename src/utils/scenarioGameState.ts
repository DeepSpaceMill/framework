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

  // Reset audio trigger counters and voice src after restoring saved state.
  // Without this, SfxActor/SoundActor would treat the restored seq values as
  // fresh play requests and replay stale audio from before the save was taken.
  // Similarly, VoiceActor would replay the voice that was playing at save time.
  gameState.sfx.seq = 0;
  gameState.sfx.stopSeq = 0;
  gameState.sound.seq = 0;
  gameState.sound.stopSeq = 0;
  gameState.voice.src = '';

  return loadedGameState;
}
