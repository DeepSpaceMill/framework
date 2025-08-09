import { executePluginCommand } from '@momoyu-ink/kit';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { backgroundAtom, characterAtom, gameStateAtom, textBoxAtom } from '../atoms';

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
  gameState: ReturnType<(typeof gameStateAtom)['read']>;
  metadata?: {
    scenarioName?: string;
    currentLine?: string;
    screenshot?: string; // Base64 encoded screenshot for future use
  };
}

export function useSaveLoad() {
  const gameState = useAtomValue(gameStateAtom);

  // Setters for individual atoms (for loading game state)
  const setBackground = useSetAtom(backgroundAtom);
  const setCharacter = useSetAtom(characterAtom);
  const setTextBox = useSetAtom(textBoxAtom);

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
          gameState: {
            // Placeholder game state for display purposes
            background: { src: '', visible: true },
            character: { characters: {} },
            textbox: { name: '', text: '', visible: true },
            timestamp: file.lastModified,
          },
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
      // Save game state to engine variables before saving
      await executePluginCommand('scenario', {
        subCommand: 'setVariables',
        variables: {
          gameState: gameState,
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
    [gameState, refreshSlots],
  );

  const loadFromSlot = useCallback(
    async (slotId: string): Promise<boolean> => {
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
        })) as typeof gameState;

        // Update local atoms with loaded state
        if (loadedGameState) {
          setBackground(loadedGameState.background);
          setCharacter(loadedGameState.character);
          setTextBox(loadedGameState.textbox);
        }

        console.log(`Load from slot ${slotId} completed`);
        return true;
      } catch (error) {
        console.error(`Load from slot ${slotId} failed:`, error);
        return false;
      }
    },
    [setBackground, setCharacter, setTextBox],
  );

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
