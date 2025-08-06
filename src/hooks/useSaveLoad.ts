import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  gameStateAtom,
  autoSaveSlotAtom,
  saveSlotAtom,
  type SaveSlot,
  backgroundAtom,
  characterAtom,
  textBoxAtom,
} from '../atoms';

// Mock storage for single-session persistence
// TODO: Replace with engine integration (executePluginCommand/executeNodeCommand)
let mockStorage: Record<string, SaveSlot> = {};
let mockAutoSave: SaveSlot | null = null;

export interface SaveLoadHookReturn {
  // Save functions
  quickSave: () => Promise<void>;
  saveToSlot: (
    slotId: string,
    metadata?: SaveSlot['metadata']
  ) => Promise<void>;

  // Load functions
  quickLoad: () => Promise<boolean>;
  loadFromSlot: (slotId: string) => Promise<boolean>;

  // Slot management
  getSaveSlots: () => Promise<SaveSlot[]>;
  deleteSaveSlot: (slotId: string) => Promise<void>;

  // Current auto-save state
  autoSave: SaveSlot | null;
  hasAutoSave: boolean;
}

export function useSaveLoad(): SaveLoadHookReturn {
  const gameState = useAtomValue(gameStateAtom);
  const [autoSave, setAutoSave] = useAtom(autoSaveSlotAtom);
  const [saveSlots, setSaveSlots] = useAtom(saveSlotAtom);

  // Setters for individual atoms
  const setBackground = useSetAtom(backgroundAtom);
  const setCharacter = useSetAtom(characterAtom);
  const setTextBox = useSetAtom(textBoxAtom);

  const quickSave = useCallback(async () => {
    const saveData: SaveSlot = {
      id: 'auto-save',
      timestamp: Date.now(),
      gameState,
      metadata: {
        scenarioName: 'example', // TODO: Get from scenario state
        currentLine: gameState.textbox.text,
      },
    };

    // Mock engine storage
    mockAutoSave = saveData;
    setAutoSave(saveData);

    console.log('Quick save completed:', saveData);
  }, [gameState, setAutoSave]);

  const saveToSlot = useCallback(
    async (slotId: string, metadata?: SaveSlot['metadata']) => {
      const saveData: SaveSlot = {
        id: slotId,
        timestamp: Date.now(),
        gameState,
        metadata: {
          scenarioName: 'example', // TODO: Get from scenario state
          currentLine: gameState.textbox.text,
          ...metadata,
        },
      };

      // Mock engine storage
      mockStorage[slotId] = saveData;
      setSaveSlots((prev) => ({ ...prev, [slotId]: saveData }));

      console.log(`Save to slot ${slotId} completed:`, saveData);
    },
    [gameState, setSaveSlots]
  );

  const quickLoad = useCallback(async (): Promise<boolean> => {
    // Load from mock storage
    const saveData = mockAutoSave;

    if (!saveData) {
      console.warn('No auto-save data found');
      return false;
    }

    // Restore game state
    setBackground(saveData.gameState.background);
    setCharacter(saveData.gameState.character);
    setTextBox(saveData.gameState.textbox);

    console.log('Quick load completed:', saveData);
    return true;
  }, [setBackground, setCharacter, setTextBox]);

  const loadFromSlot = useCallback(
    async (slotId: string): Promise<boolean> => {
      // Load from mock storage
      const saveData = mockStorage[slotId];

      if (!saveData) {
        console.warn(`No save data found for slot ${slotId}`);
        return false;
      }

      // Restore game state
      setBackground(saveData.gameState.background);
      setCharacter(saveData.gameState.character);
      setTextBox(saveData.gameState.textbox);

      console.log(`Load from slot ${slotId} completed:`, saveData);
      return true;
    },
    [setBackground, setCharacter, setTextBox]
  );

  const getSaveSlots = useCallback(async (): Promise<SaveSlot[]> => {
    // TODO: Replace with engine call to get save list
    return Object.values(mockStorage).sort((a, b) => b.timestamp - a.timestamp);
  }, []);

  const deleteSaveSlot = useCallback(
    async (slotId: string): Promise<void> => {
      // TODO: Replace with engine call to delete save
      delete mockStorage[slotId];
      setSaveSlots((prev) => {
        const newSlots = { ...prev };
        delete newSlots[slotId];
        return newSlots;
      });

      console.log(`Save slot ${slotId} deleted`);
    },
    [setSaveSlots]
  );

  return {
    quickSave,
    saveToSlot,
    quickLoad,
    loadFromSlot,
    getSaveSlots,
    deleteSaveSlot,
    autoSave,
    hasAutoSave: autoSave !== null,
  };
}
