import { useRef } from 'react';
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
        <animated.container opacity={style.opacity}>
          <CharacterSprite
            key={character.name}
            character={character}
            isCurrentSpeaker={character.name === textboxState.name}
          />
        </animated.container>
      ))}
    </container>
  );
}

interface CharacterSpriteProps {
  character: Character;
  isCurrentSpeaker: boolean;
}

function CharacterSprite({ character: propCharacter, isCurrentSpeaker }: CharacterSpriteProps) {
  const skipping = useIsSkipping();
  const characterState = useSnapshot(gameState.character) as typeof gameState.character;

  const liveCharacter = (characterState.characters as Character[]).find(
    (c) => (c.name ?? c.src) === (propCharacter.name ?? propCharacter.src),
  );

  // Track the last known live state so the leave animation uses correct props.
  // propCharacter from useTransition is stale (captured at enter time) and does
  // not reflect changes made by charAction, so we cannot rely on it as a fallback.
  const lastLiveRef = useRef<Character | null>(null);
  if (liveCharacter) {
    lastLiveRef.current = liveCharacter;
  }

  // During leave phase, fall back to last known live state instead of propCharacter
  const character = liveCharacter ?? lastLiveRef.current ?? propCharacter;

  const autoTintEnabled = characterState.autoTintEnabled;
  const autoTint = autoTintEnabled ? characterState.autoTint : '#fff';
  const currentTint = autoTintEnabled && !isCurrentSpeaker ? autoTint : character.tint;
  const tintFadeTime = autoTintEnabled && !isCurrentSpeaker ? 200 : character.fadeTime;

  // Reactive spring: re-animates automatically whenever character state changes
  const springs = useSpring({
    x: character.x,
    y: character.y,
    scale: character.scale,
    tint: currentTint,
    config: (key: string) => {
      if (key === 'tint') return { duration: skipping ? 0 : tintFadeTime, easing: easings.easeInOutCubic };
      return { duration: skipping ? 0 : character.fadeTime, easing: easings.easeInOutCubic };
    },
  });

  return (
    <animated.sprite
      src={character.src}
      tint={springs.tint}
      pivot={character.pivot}
      visible={character.visible}
      x={springs.x}
      y={springs.y}
      scale={springs.scale}
    />
  );
}
