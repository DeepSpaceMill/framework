import {
  DEBUG_EMPTY_PAGE,
  ensureArchiveVariableDefaults,
  executePluginCommand,
  getNavigator,
  type AppStateAdapter,
  type FastForwardOptions,
} from '@momoyu-ink/kit';
import { snapshotGameState, type GameState } from '../state/game';
import { getStageSingleton } from '../lib/stageSingleton';
import { applyGameStateSnapshot, resetScenarioSessionForNewGame } from '../utils/scenarioGameState';

const STAGE_ROUTE_READY_TIMEOUT_MS = 5000;

async function waitForStageStoryReady(story: string): Promise<void> {
  const deadline = Date.now() + STAGE_ROUTE_READY_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const cursor = (await executePluginCommand('scenario', {
      subCommand: 'getExecutionCursor',
    })) as { story?: string } | null;

    if (cursor?.story === story) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error(`Timed out waiting for stage story "${story}" to start`);
}

async function restartStageStoryFromHead(story: string, entry: string) {
  const navigator = getNavigator();
  const currentPage = navigator.getCurrentPage();

  if (currentPage !== 'stage') {
    throw new Error('Current page is not stage');
  }

  getStageSingleton().resetRuntimeState();
  navigator.clearOverlays();
  await resetScenarioSessionForNewGame();

  try {
    await ensureArchiveVariableDefaults();
  } catch (error) {
    console.warn('Failed to apply archive variable defaults before restarting the story:', error);
  }

  await executePluginCommand('scenario', {
    subCommand: 'addStory',
    name: story,
  });

  await executePluginCommand('scenario', {
    subCommand: 'startStory',
    name: story,
    entry,
  });
}

export const gameStateDebugAdapter: AppStateAdapter<GameState> = {
  capture() {
    return snapshotGameState();
  },
  restore(state) {
    getStageSingleton().resetRuntimeState();
    getNavigator().clearOverlays();
    applyGameStateSnapshot(state);
  },
  async switchPage(page, params) {
    const navigator = getNavigator();
    if (!navigator.hasPage(page)) {
      throw new Error(`Page "${page}" not found`);
    }

    getStageSingleton().resetRuntimeState();
    navigator.clearOverlays();

    if (page === 'stage' && params?.isNewGame === true) {
      await resetScenarioSessionForNewGame();

      try {
        await ensureArchiveVariableDefaults();
      } catch (error) {
        console.warn('Failed to apply archive variable defaults before switching to a new game route:', error);
      }
    }

    navigator.navigate(page as never, params as never);

    if (page === 'stage' && typeof params?.story === 'string') {
      await waitForStageStoryReady(params.story);
    }
  },
  switchOverlay(overlay, params) {
    const navigator = getNavigator();
    if (!navigator.hasOverlay(overlay)) {
      throw new Error(`Overlay "${overlay}" not found`);
    }

    getStageSingleton().resetRuntimeState();
    navigator.clearOverlays();
    navigator.navigate(DEBUG_EMPTY_PAGE as never);
    navigator.pushOverlay(overlay as never, params as never);
  },
  enterFastForwardMode(options?: FastForwardOptions) {
    getStageSingleton().startFastForward(options);
  },
  exitFastForwardMode() {
    getStageSingleton().stopFastForward();
  },
  async restartStoryFromHead({ story, entry = 'entry' }) {
    await restartStageStoryFromHead(story, entry);
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

    await restartStageStoryFromHead(story, entry);
  },
};
