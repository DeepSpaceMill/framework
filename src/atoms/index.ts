import { atom } from 'jotai';

// Background state atom
export interface BackgroundState {
  src: string;
  scale?: number;
  opacity?: number;
  visible?: boolean;
}

export const backgroundAtom = atom<BackgroundState>({
  src: 'non-free/classroom1.png',
  scale: 1920 / 1344,
  opacity: 1,
  visible: true,
});

// Character state atom
export interface CharacterInfo {
  id: string;
  src: string;
  position: 'left' | 'center' | 'right';
  scale: number;
  tint: string;
  visible: boolean;
  x: number;
  y: number;
  pivot: [number, number];
}

export interface CharacterState {
  characters: Record<string, CharacterInfo>;
  currentSpeaker?: string;
}

const DEFAULT_CHARACTERS: Record<string, Omit<CharacterInfo, 'id'>> = {
  left: {
    src: 'non-free/fg03_01.png',
    position: 'left',
    scale: 1.5,
    tint: '#fff',
    visible: true,
    x: 0,
    y: 1080,
    pivot: [0, 1],
  },
  center: {
    src: 'non-free/fg02_01.png',
    position: 'center',
    scale: 1.5,
    tint: '#fff',
    visible: true,
    x: 1920 / 2,
    y: 1080,
    pivot: [0.5, 1],
  },
  right: {
    src: 'non-free/fg01_01.png',
    position: 'right',
    scale: 1.5,
    tint: '#fff',
    visible: true,
    x: 1920,
    y: 1080,
    pivot: [1, 1],
  },
};

export const characterAtom = atom<CharacterState>({
  characters: Object.entries(DEFAULT_CHARACTERS).reduce(
    (acc, [id, character]) => {
      acc[id] = { id, ...character };
      return acc;
    },
    {} as Record<string, CharacterInfo>,
  ),
  currentSpeaker: undefined,
});

// TextBox state atom
export interface TextBoxState {
  name: string;
  text: string;
  visible: boolean;
}

export const textBoxAtom = atom<TextBoxState>({
  name: '',
  text: '',
  visible: false,
});

// Game state composite atom (for save/load)
export const gameStateAtom = atom((get) => ({
  background: get(backgroundAtom),
  character: get(characterAtom),
  textbox: get(textBoxAtom),
  // Add scenario progress and other game state as needed
  timestamp: Date.now(),
}));

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

export const saveSlotAtom = atom<Record<string, SaveSlot>>({});

// Auto-save atom for quick save/load
export const autoSaveSlotAtom = atom<SaveSlot | null>(null);
