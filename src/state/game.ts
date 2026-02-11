import { addEventListener, Tuple2 } from '@momoyu-ink/kit';
import { proxy, ref } from 'valtio';

export interface Animation {
  fadeTime: number;
}

export interface StoryState {
  title: string;
}

export interface BackgroundState extends Animation {
  src: string;
  tint?: string;
  skippable: boolean;
}

export interface Character extends Animation {
  name: string;
  src: string;
  scale: number;
  tint: string;
  visible: boolean;
  x: number;
  y: number;
  pivot: Tuple2;
}

export interface CharacterState {
  characters: Character[];
  currentSpeaker?: string;
}

// TextBox state interface
export interface TextBoxState {
  name: string;
  text: string;
  x?: number;
  y?: number;
  visible: boolean;
  shouldClear?: boolean;
  shouldAddNewline?: boolean;
}

export interface BGMState {
  src: string;
  loop: boolean;
  volume?: number;
  fadeTime?: number;
}

// Main game state interface
export interface GameState {
  story: StoryState;
  background: BackgroundState;
  character: CharacterState;
  textbox: TextBoxState;
  bgm: BGMState;
}

// Create the main game state store using valtio
export const gameState = proxy<GameState>({
  story: {
    title: '',
  },
  background: {
    src: '',
    fadeTime: 1000,
    skippable: false,
  },
  character: {
    characters: [],
    currentSpeaker: undefined,
  },
  textbox: {
    name: '',
    text: '',
    visible: true,
  },
  bgm: {
    src: '',
    loop: true,
  },
});

export function resetGameState() {
  gameState.background = {
    src: '',
    fadeTime: 1000,
    skippable: false,
  };
  gameState.character = {
    characters: [],
    currentSpeaker: undefined,
  };
  gameState.textbox = {
    name: '',
    text: '',
    visible: true,
  };
}
