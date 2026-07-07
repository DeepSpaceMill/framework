import { executePluginCommand, useNavigation, useSpring, WheelEvent } from '@momoyu-ink/kit';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { uiActions } from '../state/ui';
import { restoreGameStateFromScenario } from '../utils/scenarioGameState';

export type BacklogMeta =
  | {
      kind: 'text';
      speaker: string;
      voice?: string;
      text: string;
    }
  | {
      kind: 'selection';
      options: string[];
    };

export interface BacklogRecord {
  id: string;
  createdAt: number;
  meta: BacklogMeta;
}

interface UseBacklogOptions {
  itemHeight: number;
  viewportHeight: number;
  minScrollbarHeight?: number;
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function clampScrollOffset(value: number, maxScroll: number) {
  return Math.max(0, Math.min(maxScroll, value));
}

function normalizeWheelDelta(event: WheelEvent, viewportHeight: number): number {
  switch (event.deltaMode) {
    case 'line':
      return event.deltaY * 36;
    case 'page':
      return event.deltaY * viewportHeight * 0.85;
    case 'pixel':
    default:
      return event.deltaY;
  }
}

export function useBacklog({ itemHeight, viewportHeight, minScrollbarHeight = 56 }: UseBacklogOptions) {
  const navigation = useNavigation();
  const [records, setRecords] = useState<BacklogRecord[]>([]);
  const [didLoadRecords, setDidLoadRecords] = useState(false);
  const scrollTargetRef = useRef(0);
  const didSetInitialPositionRef = useRef(false);
  const [{ scrollOffset }, scrollApi] = useSpring(
    () => ({
      scrollOffset: 0,
      config: {
        tension: 320,
        friction: 32,
      },
    }),
    [],
  );

  const refreshRecords = useCallback(async () => {
    try {
      const result = (await executePluginCommand('scenario', {
        subCommand: 'getRecords',
      })) as BacklogRecord[];
      setRecords([...(result ?? [])].reverse());
    } catch (error) {
      console.error('Failed to load backlog records:', error);
      uiActions.notify('读取历史记录失败');
    } finally {
      setDidLoadRecords(true);
    }
  }, []);

  useEffect(() => {
    void refreshRecords();
  }, [refreshRecords]);

  const maxScroll = useMemo(() => {
    return Math.max(0, records.length * itemHeight - viewportHeight);
  }, [itemHeight, records.length, viewportHeight]);

  const moveTo = useCallback(
    (nextOffset: number | ((current: number) => number), immediate = false) => {
      const resolved = typeof nextOffset === 'function' ? nextOffset(scrollTargetRef.current) : nextOffset;
      const offset = clampScrollOffset(resolved, maxScroll);

      if (offset === scrollTargetRef.current && !immediate) {
        return;
      }

      scrollTargetRef.current = offset;
      scrollApi.start({
        scrollOffset: offset,
        immediate,
      });
    },
    [maxScroll, scrollApi],
  );

  useEffect(() => {
    if (!didLoadRecords) {
      return;
    }

    if (!didSetInitialPositionRef.current) {
      didSetInitialPositionRef.current = true;
      moveTo(maxScroll, true);
      return;
    }

    moveTo(scrollTargetRef.current, true);
  }, [didLoadRecords, maxScroll, moveTo]);

  const totalContentHeight = useMemo(() => records.length * itemHeight, [itemHeight, records.length]);

  const scrollbarHeight = useMemo(() => {
    if (maxScroll <= 0 || totalContentHeight <= 0) return 0;

    return Math.min(viewportHeight, Math.max(minScrollbarHeight, (viewportHeight * viewportHeight) / totalContentHeight));
  }, [maxScroll, minScrollbarHeight, totalContentHeight, viewportHeight]);

  const scrollbarOffset = useMemo(() => {
    if (maxScroll <= 0 || scrollbarHeight <= 0) return 0;

    return scrollOffset.to((value) => (value / maxScroll) * (viewportHeight - scrollbarHeight));
  }, [maxScroll, scrollOffset, scrollbarHeight, viewportHeight]);

  const scrollToRatio = useCallback(
    (nextRatio: number, immediate = false) => {
      if (maxScroll <= 0) {
        moveTo(0, true);
        return;
      }

      moveTo(clamp01(nextRatio) * maxScroll, immediate);
    },
    [maxScroll, moveTo],
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (maxScroll <= 0) return;

      const delta = normalizeWheelDelta(event, viewportHeight);

      if (delta === 0) return;

      // Keep wheel scrolling stable across mouse wheels and touchpads.
      const step = -Math.sign(delta) * Math.max(72, Math.min(Math.abs(delta), viewportHeight * 0.45));
      moveTo((current) => current + step);
    },
    [maxScroll, moveTo, viewportHeight],
  );

  const close = useCallback(() => {
    navigation.popOverlay();
  }, [navigation]);

  const jumpToRecord = useCallback(
    async (recordId: string) => {
      try {
        const success = (await executePluginCommand('scenario', {
          subCommand: 'jumpToRecord',
          recordId,
        })) as boolean;

        if (!success) {
          uiActions.notify('跳转失败');
          return false;
        }

        await restoreGameStateFromScenario();
        navigation.popOverlay();
        return true;
      } catch (error) {
        console.error('Failed to jump to backlog record:', error);
        uiActions.notify('跳转失败');
        return false;
      }
    },
    [navigation],
  );

  return {
    records,
    scrollOffset,
    maxScroll,
    showScrollbar: maxScroll > 0,
    scrollbarHeight,
    scrollbarOffset,
    scrollToRatio,
    handleWheel,
    jumpToRecord,
    close,
  };
}
