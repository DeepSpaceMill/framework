import { hai, type HaiEvent, type HaiNodeAttributes } from '@doufu-moe/kit';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';

export interface SliderProps extends HaiNodeAttributes {
  value?: number;
  defaultValue?: number;
  targetWidth?: number;
  targetHeight?: number;
  onChange?: (value: number) => void;
  onComplete?: (value: number) => void;
}

export function Slider(props: SliderProps) {
  const { label, anchor, targetWidth = 0, targetHeight = 0, ...restProps } = props;

  const startPosition = useRef<number | null>(null);
  const startValue = useRef<number>(0);
  const [value, setValue] = useState(props.value ?? props.defaultValue ?? 0);

  const handleStart = (e: HaiEvent) => {
    e.stopPropagation();
    startPosition.current = e.clientX ?? 0;
    startValue.current = value;
  };

  const handleMove = (e: HaiEvent) => {
    e.stopPropagation();
    if (startPosition.current === null) {
      return;
    }
    const delta = (e.clientX ?? 0) - startPosition.current;
    const value = startValue.current;
    const newValue = Math.max(0, Math.min(1, value + delta / targetWidth));
    setValue(newValue);
    props.onChange?.(newValue);
  };

  const handleEnd = (e: HaiEvent) => {
    e.stopPropagation();
    startPosition.current = null;
    props.onComplete?.(value);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return hai.addEventListener('mousemove', handleMove);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return hai.addEventListener('mouseup', handleEnd);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return hai.addEventListener('touchmove', handleEnd);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    return hai.addEventListener('touchend', handleEnd);
  }, []);

  return (
    <container {...restProps} pivot={anchor} anchor={anchor}>
      <sprite
        src="new2/press2.png"
        mode="nineslice"
        bounds={[0, 0, 0, 0]}
        targetWidth={targetWidth}
        targetHeight={(targetHeight * 0.2) << 0}
        pivot={[0, 0.5]}
        y={(targetHeight / 2) << 0}
      >
        <Button
          fileName={['new2/idle.png', 'new2/hover.png', 'new2/press.png']}
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={20}
          targetHeight={(targetHeight * 0.8) << 0}
          anchor={[0, 0.5]}
          pivot={[0, 0.5]}
          x={(value * (targetWidth - 20)) << 0}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        />
      </sprite>
    </container>
  );
}
