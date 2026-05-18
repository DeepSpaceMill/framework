import { ensureArchiveVariableDefaults, executePluginCommand } from '@momoyu-ink/kit';
import { useCallback, useEffect, useState } from 'react';
import { restoreGameStateFromScenario, writeCurrentGameStateToScenario } from '../utils/scenarioGameState';

// Engine save game interface
interface GameSave {
  name: string;
  // `data:` or `saves:` scheme
  snapshot: string;
  metadata: {
    edition: number;
    saveByVersion: string;
    timestamp: number;
  };
  extra?: {
    text: string;
  };
}

export function useSaveLoad() {
  const [slots, setSlots] = useState<Map<string, GameSave>>(new Map());

  // Check if auto-save exists in engine
  const checkAutoSaveExists = useCallback(async (): Promise<boolean> => {
    try {
      const gameList = (await executePluginCommand('scenario', {
        subCommand: 'getGameList',
        pattern: 'auto-save',
      })) as GameSave[];

      return gameList.length > 0;
    } catch (error) {
      console.warn('Failed to check auto-save existence:', error);
      return false;
    }
  }, []);

  const refreshSlots = useCallback(async () => {
    try {
      const slots: Map<string, GameSave> = new Map();

      // Check if auto-save exists and add it first
      const saveList = (await executePluginCommand('scenario', {
        subCommand: 'getGameList',
        pattern: '{auto-save,save-*}',
      })) as GameSave[];

      for (const save of saveList) {
        const slotId = save.name;
        slots.set(slotId, save);
      }

      setSlots(slots);
    } catch (error) {
      console.error('Failed to get save slots:', error);
    }
  }, []);

  const saveToSlot = useCallback(
    async (slotId: string) => {
      const currentGameState = writeCurrentGameStateToScenario();

      // Use engine save functionality
      await executePluginCommand('scenario', {
        subCommand: 'saveGame',
        name: slotId,
        extra: {
          text: currentGameState.textbox.text,
        },
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

      await restoreGameStateFromScenario();

      try {
        await ensureArchiveVariableDefaults();
      } catch (error) {
        console.warn('Failed to apply archive variable defaults after loading a save:', error);
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
