import {
  createGameStateContext,
  Tuple2,
  type GameStateStore as KitGameStateStore,
  type RetainMode as KitRetainMode,
  type ShaderSource as KitShaderSource,
} from '@momoyu-ink/kit';
import { CAMERA_DEFAULT_STATE } from '../lib/camera';

export interface Animation {
  fadeTime: number;
}

export type BuiltinTransitionEffect = Extract<KitShaderSource, { type: 'builtin' }>;

export interface StoryState {
  title: string;
}

export interface BackgroundState extends Animation {
  src: string;
  tint?: string;
  skippable: boolean;
  transitionEffect: BuiltinTransitionEffect;
}

export interface CameraState extends Animation {
  x: number;
  y: number;
  zoom: number;
  depth: number;
  blur: number;
}

export type SceneTransitionPhase = 'stable' | 'prepared' | 'performing';
export type SceneTransitionEffect = BuiltinTransitionEffect;
export type SceneTransitionRetain = KitRetainMode;

export interface SceneTransitionState {
  key: number;
  performKey: number;
  phase: SceneTransitionPhase;
  retain: SceneTransitionRetain;
  effect: SceneTransitionEffect;
  fadeTime: number;
  skippable: boolean;
}

export interface Character extends Animation {
  name?: string;
  src: string;
  presence: 'present' | 'entering' | 'leaving';
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
  transitionEffect: BuiltinTransitionEffect;
}

export interface TextBoxAvatarConfig {
  src: string;
  enable: boolean;
  offsetX: number;
  offsetY: number;
  /** Horizontal retreat applied to the text and name area when visible. */
  spacing: number;
}

export interface TextBoxAvatarForConfig extends TextBoxAvatarConfig {
  character: string;
  name?: string;
}

export interface TextStyle {
  fontSize?: number;
  fillColor?: string;
  lineHeight?: number;
  indent?: number;
  stroke?: boolean;
  shadow?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  shadowWidth?: number;
}

// TextBox state interface
export interface TextBoxState {
  name: string;
  text: string;
  avatarName: string;
  x?: number;
  y?: number;
  visible: boolean;
  hideReason?: 'command' | 'manual';
  shouldClear?: boolean;
  shouldAddNewline?: boolean;
  // Runtime print config overrides set by textBox command.
  printMode?: 'instant' | 'typewriter' | 'printer';
  printSpeed?: number;
  textStyle: TextStyle;
  avatar: TextBoxAvatarConfig;
  avatarFor: TextBoxAvatarForConfig[];
}

export interface BGMState {
  src: string;
  loop: boolean;
  volume: number;
  fadeTime?: number;
  /** When true, the scenario is held until the BGM finishes playing naturally. */
  waitForEnd: boolean;
}

export interface VoiceState {
  src: string;
  channel: string;
  volume: number;
  /** When true, the scenario is held until the voice finishes playing naturally. */
  waitForEnd: boolean;
}

export interface SfxState {
  seq: number;
  src: string;
  loop: boolean;
  volume: number;
  fadeTime?: number;
  /** When true, the scenario is held until the SFX finishes playing naturally. */
  waitForEnd: boolean;
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
  /** When true, the scenario is held until the sound finishes playing naturally. */
  waitForEnd: boolean;
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
  sceneTransition: SceneTransitionState;
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
    transitionEffect: { type: 'builtin', name: 'crossfade' },
  },
  camera: {
    x: CAMERA_DEFAULT_STATE.x,
    y: CAMERA_DEFAULT_STATE.y,
    zoom: CAMERA_DEFAULT_STATE.zoom,
    depth: CAMERA_DEFAULT_STATE.depth,
    blur: CAMERA_DEFAULT_STATE.blur,
    fadeTime: CAMERA_DEFAULT_STATE.fadeTime,
  },
  sceneTransition: {
    key: 0,
    performKey: 0,
    phase: 'stable',
    retain: 'static',
    effect: { type: 'builtin', name: 'crossfade' },
    fadeTime: 0,
    skippable: false,
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
    transitionEffect: { type: 'builtin', name: 'crossfade' },
  },
  textbox: {
    name: '',
    text: '',
    avatarName: '',
    visible: true,
    hideReason: undefined,
    printMode: undefined,
    printSpeed: undefined,
    textStyle: {},
    avatar: {
      src: '',
      enable: false,
      offsetX: 0,
      offsetY: 0,
      spacing: 0,
    },
    avatarFor: [],
  },
  bgm: {
    src: '',
    loop: true,
    volume: 1.0,
    fadeTime: undefined,
    waitForEnd: false,
  },
  voice: {
    src: '',
    channel: '',
    volume: 1.0,
    waitForEnd: false,
  },
  sfx: {
    seq: 0,
    src: '',
    loop: false,
    volume: 1.0,
    fadeTime: undefined,
    waitForEnd: false,
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
    waitForEnd: false,
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

export const {
  gameState,
  snapshotGameState,
  syncGameState,
  resetGameState,
  GameStateProvider,
  useGameStateStore,
  useGameStateSection,
} = createGameStateContext<GameState>(gameStateDefaults);

export type GameStateStore = KitGameStateStore<GameState>;
