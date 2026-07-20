import { addEventListener, type MouseEvent, type MoyuNodeAttributes, TouchEvent } from '@momoyu-ink/kit';
import { useEffect, useRef, useState } from 'react';
import { useButton } from '../hooks/useButton';
import { Button } from './button';

export interface SliderProps extends MoyuNodeAttributes {
  value?: number;
  defaultValue?: number;
  targetWidth?: number;
  targetHeight?: number;
  onChange?: (value: number) => void;
  onComplete?: (value: number) => void;
}

const SLIDER_WIDTH = 24;

export function Slider(props: SliderProps) {
  const {
    anchor,
    pivot = anchor,
    targetWidth = 0,
    targetHeight = 0,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    ...restProps
  } = props;

  const startPosition = useRef<number | null>(null);
  const startValue = useRef<number>(0);
  const [value, setValue] = useState(props.value ?? props.defaultValue ?? 0);

  const { handlers, getStateIndex } = useButton({
    lockOn: startPosition.current !== null ? 'press' : undefined,
    customHandlers: {
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      onTouchStart,
      onTouchEnd,
      onTouchCancel,
    },
  });

  const handleStart = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    startPosition.current = e.offsetX ?? 0;
    startValue.current = value;
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    if (startPosition.current === null) {
      return;
    }

    const delta = (e.offsetX ?? 0) - startPosition.current;
    const value = startValue.current;
    const newValue = Math.max(0, Math.min(1, value + delta / (targetWidth - SLIDER_WIDTH)));
    setValue(newValue);
    props.onChange?.(newValue);
  };

  const handleEnd = (e: MouseEvent) => {
    e.stopPropagation();
    startPosition.current = null;
    props.onComplete?.(value);
  };

  const handleTrackClick = (e: MouseEvent) => {
    e.stopPropagation();
    const clickX = e.offsetX;
    const newValue = Math.max(0, Math.min(1, (clickX - SLIDER_WIDTH / 2) / (targetWidth - SLIDER_WIDTH)));
    setValue(newValue);
    props.onChange?.(newValue);
    props.onComplete?.(newValue);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: global event handlers don't need dependencies
  useEffect(() => {
    return addEventListener('mouseup', handleEnd);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: global event handlers don't need dependencies
  useEffect(() => {
    return addEventListener('touchend', handleEnd);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: global event handlers don't need dependencies
  useEffect(() => {
    return addEventListener('touchcancel', handleEnd);
  }, []);

  return (
    <container {...restProps} {...handlers} pivot={pivot} anchor={anchor}>
      <sprite
        src={`ui/slider_track${getStateIndex() === 0 ? '' : getStateIndex() === 1 ? '_hover' : '_press'}.png`}
        mode="nineslice"
        bounds={[0, 0, 0, 0]}
        targetWidth={targetWidth}
        targetHeight={targetHeight}
        onClick={handleTrackClick}
        onMouseMove={handleMove}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        cursor="pointer"
      >
        <Button
          fileNames={['ui/slider_handle.png', 'ui/slider_handle_hover.png', 'ui/slider_handle_press.png']}
          lockOn={startPosition.current !== null ? 'press' : undefined}
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={SLIDER_WIDTH}
          targetHeight={targetHeight}
          anchor={[0, 0.5]}
          pivot={[0, 0.5]}
          x={(value * (targetWidth - SLIDER_WIDTH)) << 0}
          interactive={false}
        />
      </sprite>
    </container>
  );
}
