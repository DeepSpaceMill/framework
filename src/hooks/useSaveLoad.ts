import { executePluginCommand } from '@momoyu-ink/kit';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import { backgroundAtom, characterAtom, gameStateAtom, type SaveSlot, textBoxAtom } from '../atoms';

// Engine save game interface
interface FileEntry {
  name: string;
  isDir: boolean;
  size: number;
  lastModified: number;
}

export interface SaveLoadHookReturn {
  // Save functions
  saveToSlot: (slotId: string) => Promise<void>;

  // Load functions
  loadFromSlot: (slotId: string) => Promise<boolean>;

  // Slot management
  getSaveSlots: () => Promise<SaveSlot[]>;
  deleteSaveSlot: (slotId: string) => Promise<void>;

  // Utility functions
  checkAutoSaveExists: () => Promise<boolean>;
}

export function useSaveLoad(): SaveLoadHookReturn {
  const gameState = useAtomValue(gameStateAtom);

  // Setters for individual atoms (for loading game state)
  const setBackground = useSetAtom(backgroundAtom);
  const setCharacter = useSetAtom(characterAtom);
  const setTextBox = useSetAtom(textBoxAtom);

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

  const saveToSlot = useCallback(
    async (slotId: string) => {
      // Save game state to engine variables before saving
      await executePluginCommand('scenario', {
        subCommand: 'setVariables',
        variables: {
          gameState: gameState,
        },
      });

      let saveName: string;
      if (slotId === 'auto-save') {
        saveName = 'auto-save';
      } else {
        saveName = `save-${slotId}`;
      }

      // Use engine save functionality
      await executePluginCommand('scenario', {
        subCommand: 'saveGame',
        name: saveName,
      });

      console.log(`Save to slot ${slotId} completed`);
    },
    [gameState],
  );

  const loadFromSlot = useCallback(
    async (slotId: string): Promise<boolean> => {
      try {
        let saveName: string;
        if (slotId === 'auto-save') {
          saveName = 'auto-save';
        } else {
          saveName = `save-${slotId}`;
        }

        // Use engine load functionality
        await executePluginCommand('scenario', {
          subCommand: 'loadGame',
          name: saveName,
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

  const getSaveSlots = useCallback(async (): Promise<SaveSlot[]> => {
    try {
      const slots: SaveSlot[] = [];

      // Check if auto-save exists and add it first
      const autoSaveList = (await executePluginCommand('scenario', {
        subCommand: 'getGameList',
        pattern: 'auto-save',
      })) as FileEntry[];

      if (autoSaveList.length > 0) {
        const autoSaveFile = autoSaveList[0];
        slots.push({
          id: 'auto-save',
          timestamp: autoSaveFile.lastModified,
          gameState: {
            // Placeholder game state for display purposes
            background: { src: '', visible: true },
            character: { characters: {} },
            textbox: { name: '', text: '', visible: true },
            timestamp: autoSaveFile.lastModified,
          },
          metadata: {
            scenarioName: '快速存档',
            currentLine: '', // Placeholder
            screenshot: 'non-free/snapshot.png',
          },
        });
      }

      // Get regular save slots with save- prefix
      const gameList = (await executePluginCommand('scenario', {
        subCommand: 'getGameList',
        pattern: 'save-*',
      })) as FileEntry[];

      // Convert to map for easier lookup
      const saveMap = new Map<string, FileEntry>();
      gameList.forEach((file) => {
        const slotId = file.name.replace('save-', '');
        saveMap.set(slotId, file);
      });

      // Create slots in numerical order (1, 2, 3, ...)
      // Find the highest slot number to determine range
      const slotNumbers = Array.from(saveMap.keys())
        .map((id) => parseInt(id, 10))
        .filter((num) => !Number.isNaN(num))
        .sort((a, b) => a - b);

      const maxSlot = slotNumbers.length > 0 ? Math.max(...slotNumbers) : 0;

      // Generate slots in order, leaving gaps for missing slots
      for (let i = 1; i <= maxSlot; i++) {
        const slotId = i.toString();
        const file = saveMap.get(slotId);

        if (file) {
          slots.push({
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
        // Skip missing slots - they will show as empty in UI
      }

      return slots;
    } catch (error) {
      console.error('Failed to get save slots:', error);
      return [];
    }
  }, []);

  const deleteSaveSlot = useCallback(async (slotId: string): Promise<void> => {
    try {
      let saveName: string;
      if (slotId === 'auto-save') {
        saveName = 'auto-save';
      } else {
        saveName = `save-${slotId}`;
      }

      // Use engine to delete save
      await executePluginCommand('scenario', {
        subCommand: 'removeGame',
        name: saveName,
      });

      console.log(`Save slot ${slotId} deleted`);
    } catch (error) {
      console.error(`Failed to delete save slot ${slotId}:`, error);
    }
  }, []);

  return {
    saveToSlot,
    loadFromSlot,
    getSaveSlots,
    deleteSaveSlot,
    checkAutoSaveExists,
  };
}
