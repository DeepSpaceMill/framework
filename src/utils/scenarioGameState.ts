import { executePluginCommand } from '@momoyu-ink/kit';
import { gameState, resetGameState, snapshotGameState, syncGameState, type GameState } from '../state/game';

export function writeCurrentGameStateToScenario(): GameState {
  const currentGameState = snapshotGameState();

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
  syncGameState(loadedGameState);

  // Restored snapshots always resume from a stable visual state rather than
  // trying to reconstruct an in-flight scene transition.
  gameState.sceneTransition.phase = 'stable';
  gameState.sceneTransition.retain = 'static';

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

  // Free sprite layer always restores to a stable visual state.
  for (const [name, node] of Object.entries(gameState.freeSprite.nodes)) {
    if (node.presence === 'leaving') {
      delete gameState.freeSprite.nodes[name];
      continue;
    }

    if (node.presence === 'entering') {
      node.presence = 'present';
      node.visible = true;
    }
  }
}

export async function resetScenarioSessionForNewGame(): Promise<void> {
  resetGameState();

  await executePluginCommand('scenario', {
    subCommand: 'resetGame',
  });
}
