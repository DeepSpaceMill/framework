import { useSnapshot } from 'valtio';
import { gameState, type CharacterState } from '../state/game';

export function useCharacters() {
  const characterState = useSnapshot(gameState.characters);

  const setSpeaker = (speaker: string) => {
    gameState.characters.currentSpeaker = speaker;

    // Update character tints based on current speaker
    Object.keys(gameState.characters.characters).forEach((id) => {
      const char = gameState.characters.characters[id];
      const isSpeaking =
        speaker === char.id ||
        speaker === `角色${char.position === 'left' ? 'B' : char.position === 'right' ? 'A' : 'C'}`;

      gameState.characters.characters[id].tint = isSpeaking ? '#333' : '#fff';
    });
  };

  const showCharacter = (id: string, src: string, position: 'left' | 'center' | 'right') => {
    const defaultChar = gameState.characters.characters[position];
    gameState.characters.characters[id] = {
      ...defaultChar,
      id,
      src,
      position,
    };
  };

  const hideCharacter = (id: string) => {
    if (gameState.characters.characters[id]) {
      gameState.characters.characters[id].visible = false;
    }
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
