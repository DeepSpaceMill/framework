import { animated, useTransition, useSpring } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { useEffect } from 'react';
import { gameState, Character } from '../state/game';

export function CharacterActor() {
  const characterState = useSnapshot(gameState.character) as typeof gameState.character;
  const textboxState = useSnapshot(gameState.textbox);

  const transitions = useTransition(
    Object.values(characterState.characters).filter((char) => char.visible),
    {
      keys: (char) => char.src,
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
      config: (char) => ({
        duration: char.fadeTime,
      }),
    },
  );

  return (
    <container label="立绘容器">
      {transitions((style, character) => (
        <CharacterSprite
          key={character.name}
          character={character}
          isCurrentSpeaker={character.name === textboxState.name}
          opacity={style.opacity}
        />
      ))}
    </container>
  );
}

interface CharacterSpriteProps {
  character: Character;
  isCurrentSpeaker: boolean;
  opacity: any; // react-spring's SpringValue
}

function CharacterSprite({ character, isCurrentSpeaker, opacity }: CharacterSpriteProps) {
  const [springs, api] = useSpring(() => ({
    x: character.x,
    y: character.y,
    scale: character.scale,
    tint: isCurrentSpeaker ? character.tint : '#333',
    config: {
      duration: character.fadeTime,
    },
  }));

  // transition for x, y, scale with character.fadeTime
  useEffect(() => {
    api.start({
      x: character.x,
      y: character.y,
      scale: character.scale,
      config: {
        duration: character.fadeTime,
      },
    });
  }, [character.x, character.y, character.scale, character.fadeTime, api]);

  // transition for tint when isCurrentSpeaker changes
  useEffect(() => {
    api.start({
      tint: isCurrentSpeaker ? character.tint : '#333',
      config: {
        duration: 200,
      },
    });
  }, [isCurrentSpeaker, character.tint, api]);

  return (
    <animated.sprite
      src={character.src}
      tint={springs.tint}
      pivot={character.pivot}
      visible={character.visible}
      opacity={opacity}
      x={springs.x}
      y={springs.y}
      scale={springs.scale}
    />
  );
}
