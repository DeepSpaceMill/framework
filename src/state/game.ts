import { addEventListener, Tuple2 } from '@momoyu-ink/kit';
import { useEffect } from 'react';
import { proxy, ref } from 'valtio';

export interface BackgroundState {
  src: string;
  fadeTime: number;
}

export interface CharacterInfo {
  id: string;
  src: string;
  position: 'left' | 'center' | 'right';
  scale: number;
  tint: string;
  visible: boolean;
  x: number;
  y: number;
  pivot: Tuple2;
}

export interface CharacterState {
  characters: Record<string, CharacterInfo>;
  currentSpeaker?: string;
}

// TextBox state interface
export interface TextBoxState {
  name: string;
  text: string;
  visible: boolean;
}

// Main game state interface
export interface GameState {
  background: BackgroundState;
  characters: CharacterState;
  textbox: TextBoxState;
}

// Create the main game state store using valtio
export const gameState = proxy<GameState>({
  background: {
    src: '',
    fadeTime: 1000,
  },
  characters: {
    characters: {
      left: {
        id: 'left',
        src: 'non-free/fg03_01.png',
        position: 'left',
        scale: 1.5,
        tint: '#fff',
        visible: true,
        x: 0,
        y: 1080,
        pivot: ref([0, 1]),
      },
      center: {
        id: 'center',
        src: 'non-free/fg02_01.png',
        position: 'center',
        scale: 1.5,
        tint: '#fff',
        visible: true,
        x: 1920 / 2,
        y: 1080,
        pivot: ref([0.5, 1]),
      },
      right: {
        id: 'right',
        src: 'non-free/fg01_01.png',
        position: 'right',
        scale: 1.5,
        tint: '#fff',
        visible: true,
        x: 1920,
        y: 1080,
        pivot: ref([1, 1]),
      },
    },
    currentSpeaker: undefined,
  },
  textbox: {
    name: '',
    text: '',
    visible: false,
  },
});

export function useScenarioCommands() {
  useEffect(() => {
    return addEventListener('scenariotext', (e: TextLine) => {
      gameState.textbox.name = e.leading || '';
      gameState.textbox.text = e.text || '';
    });
  }, []);

  useEffect(() => {
    return addEventListener('scenariocommandline', (e: ScenarioCommand) => {
      const line = transformCommand(e);
      if (line.command === 'changebg') {
        gameState.background.src = line.src;
        gameState.background.fadeTime = line.fadeTime || 1000;
      }
    });
  }, []);
}

interface TextLine {
  leading?: string;
  text?: string;
}

type ScenarioCommand = ChangeBgCommand;

interface ChangeBgCommand {
  command: 'changebg';
  src: string;
  fadeTime?: number;
}

// Transform actual command object to a more convenient format
// TODO: Is this should be moved to kit or core?
function transformCommand(command: ScenarioCommand) {
  return new Proxy(command, {
    get(target, prop) {
      if (prop === 'command') {
        return target.command;
      }

      if ((target as any).flags.includes(prop)) {
        return true;
      }

      return (target as any).arguments.find((arg: any) => arg.name === prop)?.value;
    },
    has(target, prop) {
      if (prop === 'command') {
        return true;
      }

      if ((target as any).flags.includes(prop)) {
        return true;
      }

      return (target as any).arguments.some((arg: any) => arg.name === prop);
    },
    ownKeys(target) {
      return ['command', ...(target as any).flags, ...(target as any).arguments.map((arg: any) => arg.name)];
    },
    getOwnPropertyDescriptor(target, prop) {
      if (
        prop === 'command' ||
        (target as any).flags.includes(prop) ||
        (target as any).arguments.some((a: any) => a.name === prop)
      ) {
        return { configurable: true, enumerable: true };
      }
      return Object.getOwnPropertyDescriptor(target, prop as any);
    },
  });
}
