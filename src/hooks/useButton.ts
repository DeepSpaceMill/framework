import { useCallback, useEffect, useState } from 'react';
import {
  type MouseEvent,
  type TouchEvent,
  type MoyuEventHandler,
  type BubbleEvent,
} from '@momoyu-ink/kit';
import { mergeEvent } from '../utils/mergeEvent';

/**
 * A hook that provides a abstracted button component.
 * You can use this hook to create buttons with your own styles.
 *
 * @returns Button state and event handlers
 */
export type ButtonState = 'idle' | 'hover' | 'press';

export interface UseButtonOptions {
  /**
   * Initial button state, defaults to 'idle'
   */
  initialState?: ButtonState;
  /**
   * Lock the button in a specific state
   */
  lockOn?: ButtonState;
  /**
   * Callback when button is clicked
   */
  onClick?: (e: MouseEvent) => void;
  /**
   * Custom event handlers that will be merged with the default handlers
   */
  customHandlers?: {
    onMouseEnter?: MoyuEventHandler<MouseEvent>;
    onMouseLeave?: MoyuEventHandler<MouseEvent>;
    onMouseDown?: MoyuEventHandler<MouseEvent>;
    onMouseUp?: MoyuEventHandler<MouseEvent>;
    onTouchStart?: MoyuEventHandler<TouchEvent>;
    onTouchEnd?: MoyuEventHandler<TouchEvent>;
    onTouchCancel?: MoyuEventHandler<TouchEvent>;
    onClick?: MoyuEventHandler<MouseEvent>;
  };
}

export interface UseButtonResult {
  /** Current button state: 'idle', 'hover', or 'press' */
  buttonState: ButtonState;
  /** Whether the button is currently pressed */
  pressed: boolean;
  /** Ready-to-use event handlers to directly spread on your component */
  handlers: {
    onMouseEnter: MoyuEventHandler<MouseEvent>;
    onMouseLeave: MoyuEventHandler<BubbleEvent>;
    onMouseDown: MoyuEventHandler<BubbleEvent>;
    onMouseUp: MoyuEventHandler<MouseEvent>;
    onTouchStart: MoyuEventHandler<BubbleEvent>;
    onTouchEnd: MoyuEventHandler<TouchEvent>;
    onTouchCancel: MoyuEventHandler<BubbleEvent>;
    onClick: MoyuEventHandler<MouseEvent>;
  };
  /** Get the index of the current state (useful for array-based assets) */
  getStateIndex: () => number;
}

export function useButton(options: UseButtonOptions = {}): UseButtonResult {
  const {
    initialState = 'idle',
    lockOn,
    onClick,
    customHandlers = {},
  } = options;

  const [buttonState, setButtonState] = useState<ButtonState>(initialState);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    // Reset button state when lockOn changes
    if (lockOn) {
      setButtonState(lockOn);
      setPressed(lockOn === 'press');
    } else {
      setButtonState(initialState);
      setPressed(false);
    }
  }, [lockOn, initialState]);

  const handleEnter = useCallback(
    (evt: MouseEvent) => {
      if (evt.targetId === evt.currentTargetId) {
        evt.stopPropagation();
        return;
      }

      setButtonState(pressed ? 'press' : 'hover');
    },
    [pressed]
  );

  const handleLeave = useCallback((e: BubbleEvent) => {
    setButtonState('idle');
    setPressed(false);
  }, []);

  const handleMouseDown = useCallback((e: BubbleEvent) => {
    setPressed(true);
    setButtonState('press');
  }, []);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      // trigger callback before reset state or it may be flash in some cases
      if (pressed) {
        onClick?.(e);
      }
      setPressed(false);
      setButtonState('hover');
    },
    [onClick, pressed]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // Convert TouchEvent to MouseEvent for onClick handler
      if (pressed) {
        // We need to create a mouse event-like object
        const mouseEvent = {
          ...e,
          // Add any missing properties that onClick might need
        } as unknown as MouseEvent;

        onClick?.(mouseEvent);
      }
      setPressed(false);
      setButtonState('hover');
    },
    [onClick, pressed]
  );

  const handleStopPropagation = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const getStateIndex = useCallback(() => {
    const states: ButtonState[] = ['idle', 'hover', 'press'];
    return states.indexOf(lockOn ?? buttonState);
  }, [buttonState, lockOn]);

  // Merge custom handlers with default handlers
  const handlers = {
    onMouseEnter: mergeEvent(customHandlers.onMouseEnter, handleEnter),
    onMouseLeave: mergeEvent(customHandlers.onMouseLeave, handleLeave),
    onMouseDown: mergeEvent(customHandlers.onMouseDown, handleMouseDown),
    onMouseUp: mergeEvent(customHandlers.onMouseUp, handleMouseUp),
    onTouchStart: mergeEvent(customHandlers.onTouchStart, handleMouseDown),
    onTouchEnd: mergeEvent(customHandlers.onTouchEnd, handleTouchEnd),
    onTouchCancel: mergeEvent(customHandlers.onTouchCancel, handleLeave),
    onClick: mergeEvent(customHandlers.onClick, handleStopPropagation),
  };

  return {
    buttonState,
    pressed,
    handlers,
    getStateIndex,
  };
}
