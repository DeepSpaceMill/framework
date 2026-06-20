import { useSkipCallback, type Node, type RetainMode } from '@momoyu-ink/kit';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { proxy, subscribe } from 'valtio';
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

function otherSlot(slot: SlotId): SlotId {
  return slot === 'a' ? 'b' : 'a';
}

interface StableEntry {
  key: string;
  snapshot: GameState;
}

interface FromEntry {
  slot: SlotId;
  key: string;
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
  const [containerNode, setContainerNode] = useState<Node | null>(null);
  const [activeSlot, setActiveSlot] = useState<SlotId>('a');
  const [currentKey, setCurrentKey] = useState(transitionKey);
  const [fromEntry, setFromEntry] = useState<FromEntry | null>(null);
  const preparedKeyRef = useRef<string | null>(null);
  const performedTriggerRef = useRef<string | number | null | undefined>(undefined);
  const stableEntryRef = useRef<StableEntry>({
    key: transitionKey,
    snapshot: snapshotGameState(),
  });
  const committedChildrenRef = useRef(children);
  const effectivePerformKey = performKey ?? transitionKey;

  useLayoutEffect(() => {
    if (transitionKey === currentKey) {
      return;
    }

    const fromSnapshot =
      fromEntry === null
        ? retain === 'live'
          ? snapshotGameState()
          : stableEntryRef.current.snapshot
        : snapshotGameState();

    setFromEntry({
      slot: activeSlot,
      key: currentKey,
      children: committedChildrenRef.current,
      store: proxy(fromSnapshot),
    });
    setActiveSlot(otherSlot(activeSlot));
    setCurrentKey(transitionKey);
  }, [activeSlot, currentKey, fromEntry, retain, transitionKey]);

  useLayoutEffect(() => {
    if (fromEntry !== null || transitionKey !== currentKey) {
      return;
    }

    stableEntryRef.current = {
      key: currentKey,
      snapshot: snapshotGameState(),
    };
  }, [currentKey, fromEntry, transitionKey]);

  useEffect(() => {
    if (retain !== 'live') {
      return;
    }

    return subscribe(toStore, () => {
      if (fromEntry !== null || transitionKey !== currentKey) {
        return;
      }

      stableEntryRef.current = {
        key: currentKey,
        snapshot: snapshotGameState(),
      };
    });
  }, [currentKey, fromEntry, retain, toStore, transitionKey]);

  useLayoutEffect(() => {
    committedChildrenRef.current = children;
  }, [children]);

  useLayoutEffect(() => {
    if (fromEntry === null || containerNode === null) {
      return;
    }

    if (preparedKeyRef.current !== currentKey) {
      containerNode.executeCommand({
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
      containerNode.executeCommand({
        subCommand: 'prepare',
        fromChannel: 0,
        toChannel: 1,
        mode: retain,
      });
    }

    containerNode.executeCommand({
      subCommand: 'perform',
      duration,
    });
    performedTriggerRef.current = effectivePerformKey;
  }, [containerNode, currentKey, duration, effect, effectivePerformKey, fromEntry, retain]);

  const finishTransitionNow = useCallback(() => {
    if (fromEntry === null || containerNode === null || effect === undefined) {
      return;
    }

    containerNode.executeCommand({
      subCommand: 'perform',
      duration: 0,
    });
  }, [containerNode, effect, fromEntry]);

  useSkipCallback(finishTransitionNow);

  const handleContainerRef = useCallback((node: Node | null) => {
    setContainerNode(node);
  }, []);

  const handleFinished = useCallback(() => {
    preparedKeyRef.current = null;
    performedTriggerRef.current = undefined;
    setFromEntry(null);
    onFinished?.();
  }, [onFinished]);

  const activeChildren = currentKey === transitionKey ? children : committedChildrenRef.current;

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
          <GameStateProvider store={toStore}>{activeChildren}</GameStateProvider>
        </shader-slot>
      );
    }

    return null;
  };

  return (
    <shader
      label={label}
      ref={handleContainerRef}
      shader={effect ?? { type: 'builtin', name: 'crossfade' }}
      timeControl="transition"
      displayChannel={1}
      onFinished={handleFinished}
    >
      {renderSlot('a')}
      {renderSlot('b')}
    </shader>
  );
}
