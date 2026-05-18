import { executePluginCommand } from '@momoyu-ink/kit';
import { snapshot } from 'valtio';
import { gameState, resetGameState, syncGameStateSection, type GameState } from '../state/game';

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

export async function restoreGameStateFromScenario(): Promise<void> {
  const loadedGameState = (await executePluginCommand('scenario', {
    subCommand: 'getVariable',
    name: 'gameState',
  })) as GameState | undefined;

  if (!loadedGameState) {
    return;
  }

  applyGameStateSnapshot(loadedGameState);
}

export function applyGameStateSnapshot(loadedGameState: GameState): void {
  resetGameState();

  for (const key of Object.keys(loadedGameState) as Array<keyof GameState>) {
    syncGameStateSection(key, loadedGameState[key]);
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

  // Saving during a fullscreen video is forbidden by Stage gating, but
  // defensively reset the video state on restore so a stale snapshot
  // (e.g. from HMR or external tooling) cannot leave the actor stuck.
  gameState.video.visible = false;
  gameState.video.src = '';
}

export async function resetScenarioSessionForNewGame(): Promise<void> {
  resetGameState();

  await executePluginCommand('scenario', {
    subCommand: 'resetGame',
  });
}
