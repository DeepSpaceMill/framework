import { addEventListener, Tuple2 } from '@momoyu-ink/kit';
import { useEffect } from 'react';
import { proxy, ref } from 'valtio';

export interface Animation {
  fadeTime: number;
}

export interface BackgroundState extends Animation {
  src: string;
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
  visible: boolean;
}

// Main game state interface
export interface GameState {
  background: BackgroundState;
  character: CharacterState;
  textbox: TextBoxState;
}

// Create the main game state store using valtio
export const gameState = proxy<GameState>({
  background: {
    src: '',
    fadeTime: 1000,
  },
  character: {
    characters: [
      {
        name: '角色A',
        src: 'non-free/josei_20_a.png',
        scale: 0.6,
        tint: '#fff',
        visible: true,
        x: 1600,
        y: 800,
        pivot: ref([1, 0.5]),
        fadeTime: 500,
      },
    ],
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
