import { Tuple2 } from '@momoyu-ink/kit';
import { proxy } from 'valtio';

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
  name?: string;
  src: string;
  scale: number;
  tint: string;
  visible: boolean;
  x: number;
  y: number;
  pivot: Tuple2;
}

export interface CharacterState {
  presets: Record<string, { x: number; y: number }>;
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
  // Text rendering config (set by textBox command)
  printMode: 'instant' | 'typewriter' | 'printer';
  printSpeed: number;
  fillColor: string;
  lineHeight: number;
  indent: number;
  stroke: boolean;
  shadow: boolean;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  shadowWidth: number;
}

export interface BGMState {
  src: string;
  loop: boolean;
  volume?: number;
  fadeTime?: number;
}

export interface SelectionOption {
  text: string;
  value: string | number;
}

export interface SelectionState {
  visible: boolean;
  options: SelectionOption[];
  saveTo?: string;
}

// Main game state interface
export interface GameState {
  story: StoryState;
  background: BackgroundState;
  character: CharacterState;
  textbox: TextBoxState;
  bgm: BGMState;
  selection: SelectionState;
}

const gameStateDefaults: GameState = {
  story: {
    title: '',
  },
  background: {
    src: '',
    fadeTime: 1000,
    skippable: false,
  },
  character: {
    presets: {
      left: { x: 400, y: 800 },
      center: { x: 960, y: 800 },
      right: { x: 1520, y: 800 },
    },
    characters: [],
    currentSpeaker: undefined,
  },
  textbox: {
    name: '',
    text: '',
    visible: true,
    printMode: 'typewriter',
    printSpeed: 20,
    fillColor: '#f0f0f0',
    lineHeight: 1.5,
    indent: 0,
    stroke: false,
    shadow: false,
    strokeColor: '#000000',
    strokeWidth: 2,
    shadowColor: '#000000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowWidth: 0,
  },
  bgm: {
    src: '',
    loop: true,
  },
  selection: {
    visible: false,
    options: [],
    saveTo: undefined,
  },
};

// Create the main game state store using valtio
export const gameState = proxy<GameState>(JSON.parse(JSON.stringify(gameStateDefaults)));

export function resetGameState() {
  Object.assign(gameState, JSON.parse(JSON.stringify(gameStateDefaults)));
}
