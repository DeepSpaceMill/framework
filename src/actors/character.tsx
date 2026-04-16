import { animated, useTransition, useSpring, useIsSkipping, getStageSize, easings } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { gameState, Character } from '../state/game';

export function CharacterActor() {
  const characterState = useSnapshot(gameState.character) as typeof gameState.character;
  const textboxState = useSnapshot(gameState.textbox);
  const skipping = useIsSkipping();

  const transitions = useTransition(
    Object.values(characterState.characters).filter((char) => char.visible),
    {
      keys: (char) => char.name ?? char.src,
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
      config: (char) => ({
        duration: skipping ? 0 : char.fadeTime,
      }),
    },
  );

  const stageSize = getStageSize();

  return (
    <container label="立绘容器" x={stageSize.width / 2} y={stageSize.height}>
      {transitions((style, character) => (
        <CharacterSprite
          key={character.name}
          character={character}
          isCurrentSpeaker={character.name === textboxState.name}
          autoTint={characterState.autoTint}
          opacity={style.opacity}
        />
      ))}
    </container>
  );
}

interface CharacterSpriteProps {
  character: Character;
  isCurrentSpeaker: boolean;
  autoTint: string;
  opacity: any; // react-spring's SpringValue
}

function CharacterSprite({ character: propCharacter, isCurrentSpeaker, autoTint, opacity }: CharacterSpriteProps) {
  const skipping = useIsSkipping();
  const characterState = useSnapshot(gameState.character) as typeof gameState.character;
  // Read fresh data from valtio; fall back to the transition prop during leave animation
  const character =
    (characterState.characters as Character[]).find(
      (c) => (c.name ?? c.src) === (propCharacter.name ?? propCharacter.src),
    ) ?? propCharacter;

  // Reactive spring: re-animates automatically whenever character state changes
  const springs = useSpring({
    x: character.x,
    y: character.y,
    scale: character.scale,
    tint: isCurrentSpeaker ? character.tint : autoTint,
    config: (key: string) => {
      if (key === 'tint') return { duration: skipping ? 0 : 200, easing: easings.easeInOutCubic };
      return { duration: skipping ? 0 : character.fadeTime, easing: easings.easeInOutCubic };
    },
  });

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
