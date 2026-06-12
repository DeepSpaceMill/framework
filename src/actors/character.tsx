import { useCallback, useLayoutEffect, useRef, type ReactNode } from 'react';
import { animated, useSpring, useIsSeeking, useIsSkipping, getStageSize, easings } from '@momoyu-ink/kit';
import { Character, useGameStateSection, useGameStateStore } from '../state/game';
import { TransitionBoundary } from '../components/transitionBoundary';

const EMPTY_CHARACTER_KEY = '__character-empty__';
const DEFAULT_CHARACTER_SLOT_KEY = '__default__';

function getCharacterSlotKey(name?: string): string {
  return name ?? DEFAULT_CHARACTER_SLOT_KEY;
}

export function CharacterActor() {
  const characterStore = useGameStateStore().character;
  const characterState = useGameStateSection('character');

  // biome-ignore lint/correctness/useExhaustiveDependencies: it is essential to listen to characterState.characterschanges to trigger presence state update, but characterStore is also needed to update character visibility and presence state.
  useLayoutEffect(() => {
    for (const character of characterStore.characters) {
      if (character.presence === 'entering' && !character.visible) {
        character.visible = true;
        character.presence = 'present';
      }
    }
  }, [characterStore, characterState.characters]);

  const handleCharacterExited = useCallback(
    (slotKey: string) => {
      const index = characterStore.characters.findIndex((character) => getCharacterSlotKey(character.name) === slotKey);
      if (index === -1) {
        return;
      }

      const character = characterStore.characters[index];
      if (character.presence === 'leaving' && !character.visible) {
        characterStore.characters.splice(index, 1);
      }
    },
    [characterStore],
  );

  const stageSize = getStageSize();

  return (
    <container label="立绘容器" x={stageSize.width / 2} y={stageSize.height}>
      {characterState.characters.map((character) => {
        const slotKey = getCharacterSlotKey(character.name);
        const characterLabel = character.name ?? character.src;

        return (
          <CharacterTransitionBoundary
            key={slotKey}
            slotKey={slotKey}
            characterLabel={characterLabel}
            fallbackCharacter={character}
            onExited={handleCharacterExited}
          >
            <CharacterSprite slotKey={slotKey} fallbackCharacter={character} />
          </CharacterTransitionBoundary>
        );
      })}
    </container>
  );
}

interface CharacterTransitionBoundaryProps {
  slotKey: string;
  characterLabel: string;
  fallbackCharacter: Character;
  onExited: (slotKey: string) => void;
  children: ReactNode;
}

function CharacterTransitionBoundary({
  slotKey,
  characterLabel,
  fallbackCharacter,
  onExited,
  children,
}: CharacterTransitionBoundaryProps) {
  const characterState = useGameStateSection('character');
  const skipping = useIsSkipping();
  const seeking = useIsSeeking();
  const shouldSkipVisuals = skipping || seeking;
  const liveCharacter = characterState.characters.find((character) => getCharacterSlotKey(character.name) === slotKey);
  const transitionKey =
    liveCharacter === undefined || liveCharacter.presence === 'entering' || liveCharacter.presence === 'leaving'
      ? EMPTY_CHARACTER_KEY
      : liveCharacter.src;
  const fadeTime = liveCharacter?.fadeTime ?? fallbackCharacter.fadeTime;

  const handleFinished = useCallback(() => {
    onExited(slotKey);
  }, [onExited, slotKey]);

  return (
    <TransitionBoundary
      label={`立绘转场容器:${characterLabel}`}
      transitionKey={transitionKey}
      retain="static"
      performKey={`${transitionKey}:${shouldSkipVisuals ? 'skip' : 'run'}`}
      effect={characterState.transitionEffect}
      duration={shouldSkipVisuals ? 0 : fadeTime}
      onFinished={handleFinished}
    >
      {children}
    </TransitionBoundary>
  );
}

interface CharacterSpriteProps {
  slotKey: string;
  fallbackCharacter: Character;
}

function CharacterSprite({ slotKey, fallbackCharacter }: CharacterSpriteProps) {
  const skipping = useIsSkipping();
  const seeking = useIsSeeking();
  const shouldSkipVisuals = skipping || seeking;
  const characterState = useGameStateSection('character');

  const liveCharacter = characterState.characters.find((character) => getCharacterSlotKey(character.name) === slotKey);

  const lastVisibleRef = useRef<Character | null>(null);
  if (liveCharacter?.visible) {
    lastVisibleRef.current = liveCharacter;
  }

  const character = liveCharacter ?? lastVisibleRef.current ?? fallbackCharacter;
  const isCurrentSpeaker = character.name !== undefined && character.name === characterState.currentSpeaker;

  const autoTintEnabled = characterState.autoTintEnabled;
  const autoTint = autoTintEnabled ? characterState.autoTint : '#fff';
  const currentTint = autoTintEnabled && !isCurrentSpeaker ? autoTint : character.tint;
  const tintFadeTime = autoTintEnabled && !isCurrentSpeaker ? 200 : character.fadeTime;

  const springs = useSpring({
    x: character.x,
    y: character.y,
    scale: character.scale,
    tint: currentTint,
    config: (key: string) => {
      if (key === 'tint') return { duration: shouldSkipVisuals ? 0 : tintFadeTime, easing: easings.easeInOutCubic };
      return { duration: shouldSkipVisuals ? 0 : character.fadeTime, easing: easings.easeInOutCubic };
    },
  });

  return (
    <container label="角色图片层">
      <animated.sprite
        src={character.src}
        tint={springs.tint}
        pivot={character.pivot}
        visible={character.visible}
        x={springs.x}
        y={springs.y}
        scale={springs.scale}
      />
    </container>
  );
}
