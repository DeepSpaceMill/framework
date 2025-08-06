import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { addEventListener } from '@momoyu-ink/kit';
import {
  characterAtom,
  type CharacterInfo,
  type CharacterState,
} from '../atoms';

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

export function useCharacters() {
  const [characterState, setCharacterState] = useAtom(characterAtom);

  useEffect(() => {
    return addEventListener('scenarionextline', (e) => {
      if (e.type === 'commandline') {
        // Handle character commands
        // Example: show character_a left fade_in 1000
        // This will be implemented when command definitions are available
      }
    });
  }, []);

  const setSpeaker = (speaker: string) => {
    setCharacterState((prev: CharacterState) => ({
      ...prev,
      currentSpeaker: speaker,
      characters: Object.fromEntries(
        Object.entries(prev.characters).map(([id, char]) => [
          id,
          {
            ...char,
            tint:
              speaker === char.id ||
              speaker ===
                `角色${
                  char.position === 'left'
                    ? 'B'
                    : char.position === 'right'
                    ? 'A'
                    : 'C'
                }`
                ? '#333'
                : '#fff',
          },
        ])
      ),
    }));
  };

  const showCharacter = (
    id: string,
    src: string,
    position: 'left' | 'center' | 'right'
  ) => {
    const defaults = DEFAULT_CHARACTERS[position];
    setCharacterState((prev: CharacterState) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [id]: {
          ...defaults,
          id,
          src,
          position,
        },
      },
    }));
  };

  const hideCharacter = (id: string) => {
    setCharacterState((prev: CharacterState) => ({
      ...prev,
      characters: {
        ...prev.characters,
        [id]: {
          ...prev.characters[id],
          visible: false,
        },
      },
    }));
  };

  return {
    characterState,
    setSpeaker,
    showCharacter,
    hideCharacter,
  };
}

interface CharacterActorProps {
  characterState: CharacterState;
}

export function CharacterActor({ characterState }: CharacterActorProps) {
  return (
    <container label="立绘容器">
      {Object.values(characterState.characters).map((character) => (
        <sprite
          key={character.id}
          label={`立绘-${character.position}`}
          src={character.src}
          tint={character.tint}
          pivot={character.pivot}
          scale={character.scale}
          x={character.x}
          y={character.y}
          visible={character.visible}
        />
      ))}
    </container>
  );
}
