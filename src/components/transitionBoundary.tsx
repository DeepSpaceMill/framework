import { useSkipCallback, type Node, type RetainMode } from '@momoyu-ink/kit';
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { proxy } from 'valtio';
import {
  snapshotGameState,
  type GameState,
  type GameStateStore,
  type SceneTransitionEffect,
  useGameStateStore,
  GameStateProvider,
} from '../state/game';

export interface TransitionBoundaryProps {
  transitionKey: string;
  retain?: RetainMode;
  effect?: SceneTransitionEffect;
  duration?: number;
  performKey?: string | number | null;
  label?: string;
  onFinished?: () => void;
  children: ReactNode;
}

type SlotId = 'a' | 'b';

interface FromEntry {
  slot: SlotId;
  children: ReactNode;
  store: GameStateStore;
}

export function TransitionBoundary({
  transitionKey,
  retain = 'static',
  effect,
  duration,
  performKey,
  label = 'Transition Boundary',
  onFinished,
  children,
}: TransitionBoundaryProps) {
  const toStore = useGameStateStore();
  const shaderRef = useRef<Node | null>(null);
  const [activeSlot, setActiveSlot] = useState<SlotId>('a');
  const [currentKey, setCurrentKey] = useState(transitionKey);
  const [fromEntry, setFromEntry] = useState<FromEntry | null>(null);
  const preparedKeyRef = useRef<string | null>(null);
  const performedTriggerRef = useRef<string | number | null | undefined>(undefined);
  const stableSnapshotRef = useRef<GameState>(snapshotGameState());
  const stableChildrenRef = useRef<ReactNode>(children);
  const effectivePerformKey = performKey ?? transitionKey;
  const maskRule = effect?.type === 'builtin' && effect.name === 'mask' ? effect.rule : undefined;

  useLayoutEffect(() => {
    if (transitionKey === currentKey) {
      return;
    }

    setFromEntry({
      slot: activeSlot,
      children: stableChildrenRef.current,
      store: proxy(stableSnapshotRef.current),
    });
    setActiveSlot(activeSlot === 'a' ? 'b' : 'a');
    setCurrentKey(transitionKey);
  }, [activeSlot, currentKey, transitionKey]);

  useLayoutEffect(() => {
    if (fromEntry !== null || transitionKey !== currentKey) {
      return;
    }

    stableSnapshotRef.current = snapshotGameState();
    stableChildrenRef.current = children;
  }, [children, currentKey, transitionKey, fromEntry]);

  useLayoutEffect(() => {
    if (fromEntry === null || shaderRef.current === null) {
      return;
    }

    if (preparedKeyRef.current !== currentKey) {
      shaderRef.current.executeCommand({
        subCommand: 'prepare',
        fromChannel: 0,
        toChannel: 1,
        mode: retain,
      });
      preparedKeyRef.current = currentKey;
      performedTriggerRef.current = undefined;
    }

    if (effect === undefined || duration === undefined || performedTriggerRef.current === effectivePerformKey) {
      return;
    }

    if (performedTriggerRef.current !== undefined) {
      shaderRef.current.executeCommand({
        subCommand: 'prepare',
        fromChannel: 0,
        toChannel: 1,
        mode: retain,
      });
    }

    shaderRef.current.executeCommand({
      subCommand: 'perform',
      duration,
    });
    performedTriggerRef.current = effectivePerformKey;
  }, [currentKey, duration, effect, effectivePerformKey, fromEntry, retain]);

  const finishTransitionNow = useCallback(() => {
    if (fromEntry === null || shaderRef.current === null || effect === undefined) {
      return;
    }

    shaderRef.current.executeCommand({
      subCommand: 'perform',
      duration: 0,
    });
  }, [effect, fromEntry]);

  useSkipCallback(finishTransitionNow);

  const handleFinished = useCallback(() => {
    preparedKeyRef.current = null;
    performedTriggerRef.current = undefined;
    stableSnapshotRef.current = snapshotGameState();
    stableChildrenRef.current = children;
    setFromEntry(null);
    onFinished?.();
  }, [children, onFinished]);

  const renderSlot = (slot: SlotId) => {
    if (fromEntry?.slot === slot) {
      return (
        <shader-slot key={`slot-${slot}`} channel={0}>
          <GameStateProvider store={fromEntry.store}>{fromEntry.children}</GameStateProvider>
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
      label={label}
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
