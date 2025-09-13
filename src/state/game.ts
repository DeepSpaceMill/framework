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
    return addEventListener('scenarionextline', (e) => {
      if (e.type === 'text') {
        gameState.textbox.name = e.leading || '';
        gameState.textbox.text = e.text || '';
      }
    });
  }, []);
}
