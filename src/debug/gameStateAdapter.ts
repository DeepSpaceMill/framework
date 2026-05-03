import { getNavigator, type AppStateAdapter } from '@momoyu-ink/kit';
import { snapshot } from 'valtio';
import { gameState, type GameState } from '../state/game';
import { getStageSingleton } from '../lib/stageSingleton';
import { applyGameStateSnapshot } from '../utils/scenarioGameState';

export const gameStateDebugAdapter: AppStateAdapter<GameState> = {
  capture() {
    return snapshot(gameState) as GameState;
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
};
