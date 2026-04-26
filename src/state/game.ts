import { Tuple2 } from '@momoyu-ink/kit';
import { proxy } from 'valtio';
import { CAMERA_DEFAULT_STATE } from '../lib/camera';

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

export interface CameraState extends Animation {
  x: number;
  y: number;
  zoom: number;
  depth: number;
  blur: number;
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

export interface CharacterPreset {
  x?: number;
  y?: number;
  scale?: number;
  tint?: string;
  visible?: boolean;
  pivot?: Tuple2;
  fadeTime?: number;
}

export interface CharacterState {
  presets: Record<string, CharacterPreset>;
  characters: Character[];
  currentSpeaker?: string;
  autoTintEnabled: boolean;
  autoTint: string;
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
  volume: number;
  fadeTime?: number;
}

export interface VoiceState {
  src: string;
  channel: string;
  volume: number;
}

export interface SfxState {
  seq: number;
  src: string;
  loop: boolean;
  volume: number;
  fadeTime?: number;
  stopSeq: number;
  stopFadeTime?: number;
}

export interface SoundState {
  seq: number;
  channel: string;
  src: string;
  loop: boolean;
  volume: number;
  fadeTime?: number;
  stopSeq: number;
  stopChannel: string;
  stopFadeTime?: number;
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

export interface VideoState {
  // Whether the fullscreen video is currently active. Stays true throughout
  // play-in, playback, and play-out; only flips to false after the leave
  // animation finishes inside VideoActor.
  visible: boolean;
  src: string;
  fadeTime: number;
  skippable: boolean;
}

// Main game state interface
export interface GameState {
  story: StoryState;
  background: BackgroundState;
  camera: CameraState;
  character: CharacterState;
  textbox: TextBoxState;
  bgm: BGMState;
  voice: VoiceState;
  sfx: SfxState;
  sound: SoundState;
  selection: SelectionState;
  video: VideoState;
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
  camera: {
    x: CAMERA_DEFAULT_STATE.x,
    y: CAMERA_DEFAULT_STATE.y,
    zoom: CAMERA_DEFAULT_STATE.zoom,
    depth: CAMERA_DEFAULT_STATE.depth,
    blur: CAMERA_DEFAULT_STATE.blur,
    fadeTime: CAMERA_DEFAULT_STATE.fadeTime,
  },
  character: {
    presets: {
      left: { x: -560, y: 0 },
      center: { x: 0, y: 0 },
      right: { x: 560, y: 0 },
    },
    characters: [],
    currentSpeaker: undefined,
    autoTintEnabled: true,
    autoTint: '#666',
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
    volume: 1.0,
    fadeTime: undefined,
  },
  voice: {
    src: '',
    channel: '',
    volume: 1.0,
  },
  sfx: {
    seq: 0,
    src: '',
    loop: false,
    volume: 1.0,
    fadeTime: undefined,
    stopSeq: 0,
    stopFadeTime: undefined,
  },
  sound: {
    seq: 0,
    channel: '',
    src: '',
    loop: false,
    volume: 1.0,
    fadeTime: undefined,
    stopSeq: 0,
    stopChannel: '',
    stopFadeTime: undefined,
  },
  selection: {
    visible: false,
    options: [],
    saveTo: undefined,
  },
  video: {
    visible: false,
    src: '',
    fadeTime: 0,
    skippable: false,
  },
};

// Create the main game state store using valtio
export const gameState = proxy<GameState>(JSON.parse(JSON.stringify(gameStateDefaults)));

export function resetGameState() {
  Object.assign(gameState, JSON.parse(JSON.stringify(gameStateDefaults)));
}
