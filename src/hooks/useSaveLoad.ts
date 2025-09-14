import { executePluginCommand } from '@momoyu-ink/kit';
import { useCallback, useEffect, useState } from 'react';
import { snapshot } from 'valtio';
import { gameState, type GameState } from '../state/game';

// Engine save game interface
interface FileEntry {
  name: string;
  isDir: boolean;
  size: number;
  lastModified: number;
}

// Save slot management
export interface SaveSlot {
  id: string;
  timestamp: number;
  gameState: GameState;
  metadata?: {
    scenarioName?: string;
    currentLine?: string;
    screenshot?: string; // Base64 encoded screenshot for future use
  };
}

export function useSaveLoad() {
  const [slots, setSlots] = useState<Map<string, SaveSlot>>(new Map());

  // Check if auto-save exists in engine
  const checkAutoSaveExists = useCallback(async (): Promise<boolean> => {
    try {
      const gameList = (await executePluginCommand('scenario', {
        subCommand: 'getGameList',
        pattern: 'auto-save',
      })) as FileEntry[];

      return gameList.length > 0;
    } catch (error) {
      console.warn('Failed to check auto-save existence:', error);
      return false;
    }
  }, []);

  const refreshSlots = useCallback(async () => {
    try {
      const slots: Map<string, SaveSlot> = new Map();

      // Check if auto-save exists and add it first
      const gameList = (await executePluginCommand('scenario', {
        subCommand: 'getGameList',
        pattern: '{auto-save,save-*}',
      })) as FileEntry[];

      for (const file of gameList) {
        const slotId = file.name;
        slots.set(slotId, {
          id: slotId,
          timestamp: file.lastModified,
          gameState: {} as any,
          metadata: {
            scenarioName: `存档 ${slotId}`,
            currentLine: '', // Placeholder
            screenshot: 'non-free/snapshot.png',
          },
        });
      }

      setSlots(slots);
    } catch (error) {
      console.error('Failed to get save slots:', error);
    }
  }, []);

  const saveToSlot = useCallback(
    async (slotId: string) => {
      const currentGameState = snapshot(gameState);

      // Save game state to engine variables before saving
      await executePluginCommand('scenario', {
        subCommand: 'setVariables',
        variables: {
          gameState: currentGameState,
        },
      });

      // Use engine save functionality
      await executePluginCommand('scenario', {
        subCommand: 'saveGame',
        name: slotId,
      });

      console.log(`Save to slot ${slotId} completed`);

      refreshSlots();
    },
    [refreshSlots],
  );

  const loadFromSlot = useCallback(async (slotId: string): Promise<boolean> => {
    try {
      // Use engine load functionality
      await executePluginCommand('scenario', {
        subCommand: 'loadGame',
        name: slotId,
        overwrite: true,
      });

      // Get the loaded game state from engine variables
      const loadedGameState = (await executePluginCommand('scenario', {
        subCommand: 'getVariable',
        name: 'gameState',
      })) as GameState;

      // Update local state with loaded state - much simpler with valtio!
      if (loadedGameState) {
        Object.assign(gameState, loadedGameState);
      }

      console.log(`Load from slot ${slotId} completed`);
      return true;
    } catch (error) {
      console.error(`Load from slot ${slotId} failed:`, error);
      return false;
    }
  }, []);

  const deleteSaveSlot = useCallback(
    async (slotId: string): Promise<void> => {
      try {
        // Use engine to delete save
        await executePluginCommand('scenario', {
          subCommand: 'removeGame',
          name: slotId,
        });

        console.log(`Save slot ${slotId} deleted`);

        refreshSlots();
      } catch (error) {
        console.error(`Failed to delete save slot ${slotId}:`, error);
      }
    },
    [refreshSlots],
  );

  // Initialize slots at mount
  useEffect(() => {
    refreshSlots();
  }, [refreshSlots]);

  return {
    slots,
    saveToSlot,
    loadFromSlot,
    refreshSlots,
    deleteSaveSlot,
    checkAutoSaveExists,
  };
}
