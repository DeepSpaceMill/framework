import { useIsSeeking, useIsSkipping, useSkipCallback, type Node } from '@momoyu-ink/kit';
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { proxy } from 'valtio';
import {
  gameState,
  snapshotGameState,
  type GameStateStore,
  useGameStateSection,
  useGameStateStore,
  GameStateProvider,
} from '../state/game';

interface SceneTransitionBoundaryProps {
  children: ReactNode;
}

type SlotId = 'a' | 'b';

interface FromEntry {
  key: number;
  slot: SlotId;
  store: GameStateStore;
}

export function SceneTransitionBoundary({ children }: SceneTransitionBoundaryProps) {
  const sceneTransition = useGameStateSection('sceneTransition');
  const toStore = useGameStateStore();
  const skipping = useIsSkipping();
  const seeking = useIsSeeking();
  const shouldSkipVisuals = skipping || seeking;
  const shaderRef = useRef<Node | null>(null);
  const [activeSlot, setActiveSlot] = useState<SlotId>('a');
  const preparedKeyRef = useRef<number | null>(null);
  const performedTriggerRef = useRef<string | number | null | undefined>(undefined);
  const [fromEntry, setFromEntry] = useState<FromEntry | null>(null);
  const effectivePerformKey = `${sceneTransition.performKey}:${shouldSkipVisuals ? 'skip' : 'run'}`;
  const effect = sceneTransition.phase === 'performing' ? sceneTransition.effect : undefined;
  const duration = sceneTransition.phase === 'performing' ? (shouldSkipVisuals ? 0 : sceneTransition.fadeTime) : undefined;
  const maskRule = effect?.type === 'builtin' && effect.name === 'mask' ? effect.rule : undefined;

  useLayoutEffect(() => {
    if (sceneTransition.phase === 'stable' || fromEntry?.key === sceneTransition.key) {
      return;
    }

    setFromEntry({
      key: sceneTransition.key,
      slot: activeSlot,
      store: proxy(snapshotGameState()),
    });
    setActiveSlot(activeSlot === 'a' ? 'b' : 'a');
  }, [activeSlot, fromEntry?.key, sceneTransition.key, sceneTransition.phase]);

  // Capture the old scene at transPrepare time, then keep channel 0 frozen
  // while channel 1 continues to render the live scene store.
  useLayoutEffect(() => {
    if (fromEntry === null || shaderRef.current === null || preparedKeyRef.current === sceneTransition.key) {
      return;
    }

    shaderRef.current.executeCommand({
      subCommand: 'prepare',
      fromChannel: 0,
      toChannel: 1,
      mode: sceneTransition.retain,
    });
    preparedKeyRef.current = sceneTransition.key;
    performedTriggerRef.current = undefined;
  }, [fromEntry, sceneTransition.key, sceneTransition.retain]);

  useLayoutEffect(() => {
    if (
      sceneTransition.phase !== 'performing' ||
      fromEntry === null ||
      shaderRef.current === null ||
      effect === undefined ||
      duration === undefined ||
      performedTriggerRef.current === effectivePerformKey
    ) {
      return;
    }

    if (performedTriggerRef.current !== undefined) {
      shaderRef.current.executeCommand({
        subCommand: 'prepare',
        fromChannel: 0,
        toChannel: 1,
        mode: sceneTransition.retain,
      });
    }

    shaderRef.current.executeCommand({
      subCommand: 'perform',
      duration,
    });
    performedTriggerRef.current = effectivePerformKey;
  }, [duration, effect, effectivePerformKey, fromEntry, sceneTransition.phase, sceneTransition.retain]);

  const finishTransitionNow = useCallback(() => {
    if (sceneTransition.phase !== 'performing' || shaderRef.current === null || effect === undefined) {
      return;
    }

    shaderRef.current.executeCommand({
      subCommand: 'perform',
      duration: 0,
    });
  }, [effect, sceneTransition.phase]);

  useSkipCallback(finishTransitionNow);

  const handleFinished = useCallback(() => {
    if (gameState.sceneTransition.phase !== 'performing') {
      return;
    }

    preparedKeyRef.current = null;
    performedTriggerRef.current = undefined;
    setFromEntry(null);
    gameState.sceneTransition.phase = 'stable';
    gameState.sceneTransition.retain = 'static';
  }, []);

  const renderSlot = (slot: SlotId) => {
    if (fromEntry?.slot === slot) {
      return (
        <shader-slot key={`slot-${slot}`} channel={0}>
          <GameStateProvider store={fromEntry.store}>{children}</GameStateProvider>
        </shader-slot>
      );
    }

    if (activeSlot === slot) {
      return (
        <shader-slot key={`slot-${slot}`} channel={1}>
          <GameStateProvider store={toStore}>{children}</GameStateProvider>
        </shader-slot>
      );
    }

    return null;
  };

  return (
    <shader
      label="场景转场容器"
      ref={shaderRef}
      shader={effect ?? { type: 'builtin', name: 'crossfade' }}
      timeControl="transition"
      displayChannel={1}
      onFinished={handleFinished}
    >
      {renderSlot('a')}
      {renderSlot('b')}
      {maskRule ? (
        <shader-slot channel={2} static={true} space="shader">
          <sprite src={maskRule} />
        </shader-slot>
      ) : null}
    </shader>
  );
}
