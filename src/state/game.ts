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
    characters: [],
    currentSpeaker: undefined,
  },
  textbox: {
    name: '',
    text: '',
    visible: false,
  },
});

export function useScenarioCommands(nextLine: () => void) {
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
      } else if (line.command === 'addchar') {
        const existingIndex = gameState.character.characters.findIndex((c) => c.name === line.name);
        if (existingIndex !== -1) {
          // If character already exists, update it
          const char = gameState.character.characters[existingIndex];
          char.src = line.src;
          char.x = line.x ?? char.x;
          char.y = line.y ?? char.y;
          char.scale = line.scale ?? char.scale;
          char.tint = line.tint ?? char.tint;
          char.pivot = line.pivot ?? char.pivot;
          char.fadeTime = line.fadeTime ?? 500;
          char.visible = line.visible ?? true;
        } else {
          // Add new character
          gameState.character.characters.push({
            name: line.name,
            src: line.src,
            x: line.x ?? 0,
            y: line.y ?? 0,
            scale: line.scale ?? 1,
            tint: line.tint ?? '#fff',
            pivot: line.pivot ?? [0.5, 0.5],
            fadeTime: line.fadeTime ?? 500,
            visible: line.visible ?? true,
          });
        }
      }

      nextLine();
    });
  }, [nextLine]);
}

interface TextLine {
  leading?: string;
  text?: string;
}

type ScenarioCommand =
  | ChangeBgCommand
  | CharAddCommand
  | CharChangeCommand
  | CharRemoveCommand
  | CharClearCommand
  | CharNameCommand;

interface ChangeBgCommand {
  command: 'changebg';
  src: string;
  fadeTime?: number;
}

interface CharAddCommand {
  command: 'addchar';
  name: string;
  src: string;
  x?: number;
  y?: number;
  visible?: boolean;
  scale?: number;
  tint?: string;
  pivot?: Tuple2;
  fadeTime?: number;
}

interface CharChangeCommand {
  command: 'charchange';
  name: string;
  src?: string;
  x?: number;
  y?: number;
  visible?: boolean;
  scale?: number;
  tint?: string;
  pivot?: Tuple2;
  fadeTime?: number;
}

interface CharRemoveCommand {
  command: 'charremove';
  name: string;
  fadeTime?: number;
}

interface CharClearCommand {
  command: 'charclear';
  fadeTime?: number;
}

interface CharNameCommand {
  command: 'charname';
  name: string;
  to: string;
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
