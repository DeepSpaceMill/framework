import {
  moyu,
  type MouseEvent,
  type MoyuNodeAttributes,
  addEventListener,
  TouchEvent,
} from '@momoyu-ink/kit';
import React, { useState, useRef, useEffect } from 'react';
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
    label,
    anchor,
    targetWidth = 0,
    targetHeight = 0,
    ...restProps
  } = props;

  const startPosition = useRef<number | null>(null);
  const startValue = useRef<number>(0);
  const [value, setValue] = useState(props.value ?? props.defaultValue ?? 0);

  const handleStart = (e: MouseEvent | TouchEvent) => {
    e.stopPropagation();
    startPosition.current = e.clientX ?? 0;
    startValue.current = value;
  };

  const handleMove = (e: MouseEvent) => {
    e.stopPropagation();
    if (startPosition.current === null) {
      return;
    }
    const delta = (e.clientX ?? 0) - startPosition.current;
    const value = startValue.current;
    const newValue = Math.max(
      0,
      Math.min(1, value + delta / (targetWidth - SLIDER_WIDTH))
    );
    setValue(newValue);
    props.onChange?.(newValue);
  };

  const handleEnd = (e: MouseEvent) => {
    e.stopPropagation();
    startPosition.current = null;
    props.onComplete?.(value);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return addEventListener('mousemove', handleMove);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return addEventListener('mouseup', handleEnd);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return addEventListener('touchmove', handleEnd);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return addEventListener('touchend', handleEnd);
  }, []);

  return (
    <container {...restProps} pivot={anchor} anchor={anchor}>
      <sprite
        src="ui/slider_track.png"
        mode="nineslice"
        bounds={[0, 0, 0, 0]}
        targetWidth={targetWidth}
        targetHeight={targetHeight}
        pivot={[0, 0.5]}
        y={(targetHeight / 2) << 0}
      >
        <Button
          fileNames={[
            'ui/slider_handle.png',
            'ui/slider_handle_hover.png',
            'ui/slider_handle_press.png',
          ]}
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={SLIDER_WIDTH}
          targetHeight={targetHeight}
          anchor={[0, 0.5]}
          pivot={[0, 0.5]}
          x={(value * (targetWidth - SLIDER_WIDTH)) << 0}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        />
      </sprite>
    </container>
  );
}
