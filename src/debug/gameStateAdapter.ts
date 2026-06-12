import { executePluginCommand, getNavigator, type AppStateAdapter, type FastForwardOptions } from '@momoyu-ink/kit';
import { resetGameState, snapshotGameState, type GameState } from '../state/game';
import { getStageSingleton } from '../lib/stageSingleton';
import { applyGameStateSnapshot } from '../utils/scenarioGameState';

export const gameStateDebugAdapter: AppStateAdapter<GameState> = {
  capture() {
    return snapshotGameState();
  },
  restore(state) {
    getStageSingleton().resetRuntimeState();
    getNavigator().clearOverlays();
    applyGameStateSnapshot(state);
  },
  switchPage(page, params) {
    const navigator = getNavigator();
    if (!navigator.hasPage(page)) {
      throw new Error(`Page "${page}" not found`);
    }

    getStageSingleton().resetRuntimeState();
    navigator.clearOverlays();
    navigator.navigate(page as never, params as never);
  },
  enterFastForwardMode(options?: FastForwardOptions) {
    getStageSingleton().startFastForward(options);
  },
  exitFastForwardMode() {
    getStageSingleton().stopFastForward();
  },
  async restartCurrentStoryFromHead() {
    const navigator = getNavigator();
    const currentPage = navigator.getCurrentPage();
    const params = navigator.getParams();

    if (currentPage !== 'stage') {
      throw new Error('Current page is not stage');
    }

    const story = typeof params?.story === 'string' ? params.story : undefined;
    const entry = typeof params?.entry === 'string' ? params.entry : undefined;
    if (!story || !entry) {
      throw new Error('Current stage params are missing story or entry');
    }

    getStageSingleton().resetRuntimeState();
    navigator.clearOverlays();
    resetGameState();

    try {
      await executePluginCommand('scenario', {
        subCommand: 'terminateStory',
      });
    } catch {
      // Ignore when the current story is already stopped.
    }

    await executePluginCommand('scenario', {
      subCommand: 'startStory',
      name: story,
      entry,
    });
  },
};
