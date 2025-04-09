import { type MoyuEvent, type MoyuNodeAttributes, type MouseEvent, animated, useSpring } from '@momoyu-ink/kit';
import React, { useState } from 'react';
import { mergeEvent } from '../utils/mergeEvent';

export interface ButtonProps extends MoyuNodeAttributes {
  fileName: string | string[];
  label?: string;
  text?: string;
  fontSize?: number;
  color?: string | string[];
  mode?: 'normal' | 'nineslice';
  bounds?: [number, number, number, number];
  targetWidth?: number;
  targetHeight?: number;
  onClick?: (e: MouseEvent) => void;
  lockOn?: 'idle' | 'hover' | 'press';
  textAlign?: 'left' | 'center' | 'right';
}

export function Button(props: ButtonProps) {
  const {
    fileName,
    label,
    text,
    fontSize,
    color,
    onClick,
    anchor,
    tint,
    mode,
    bounds,
    targetWidth,
    targetHeight,
    lockOn,
    ...restProps
  } = props;

  const [buttonState, setButtonState] = useState(lockOn ?? 'idle');
  const [pressed, setPressed] = useState(false);

  const handleEnter = (evt: MouseEvent) => {
    if (evt.targetId === evt.currentTargetId) {
      evt.stopPropagation();
      return;
    }

    setButtonState(pressed ? 'press' : 'hover');
  };

  const handleLeave = () => {
    setButtonState('idle');
    setPressed(false);
  };

  const handleMouseDown = () => {
    setPressed(true);
    setButtonState('press');
  };

  const handleMouseUp = (e: MouseEvent) => {
    // trigger callback before reset state or it may be flash in some cases
    if (pressed) {
      onClick?.(e);
    }
    setPressed(false);
    setButtonState('hover');
  };

  const filenames = Array.isArray(fileName)
    ? fileName
    : [`${fileName}.png`, `${fileName}_hover.png`, `${fileName}_click.png`];

  const colors = Array.isArray(color) ? color : [color, color, color];

  const index = ['idle', 'hover', 'press'].indexOf(lockOn ?? buttonState);
  let textAnchor = [0.5, 0.5] as [number, number];
  let textPivot = [0.5, 0.5] as [number, number];
  if (props.textAlign === 'left') {
    textPivot = [0, 0.5];
    textAnchor = [0, 0.5];
  } else if (props.textAlign === 'right') {
    textPivot = [1, 0.5];
    textAnchor = [1, 0.5];
  }

  return (
    <container
      label={label}
      {...restProps}
      onMouseEnter={mergeEvent(props.onMouseEnter, handleEnter)}
      onMouseLeave={mergeEvent(props.onMouseLeave, handleLeave)}
      onMouseDown={mergeEvent(props.onMouseDown, handleMouseDown)}
      onMouseUp={mergeEvent(props.onMouseUp, handleMouseUp)}
      onTouchStart={mergeEvent(props.onTouchStart, handleMouseDown)}
      onTouchEnd={mergeEvent(props.onTouchEnd, handleMouseUp)}
      onTouchCancel={mergeEvent(props.onTouchCancel, handleLeave)}
      onClick={(e) => e.stopPropagation()}
      pivot={anchor}
      anchor={anchor}
    >
      <animated.sprite
        label={`${label}_sprite`}
        src={filenames[index]}
        cursor="pointer"
        pivot={anchor}
        anchor={anchor}
        tint={tint}
        mode={mode}
        bounds={bounds}
        targetWidth={targetWidth}
        targetHeight={targetHeight}
      >
        {text && (
          <text
            text={text}
            glyphGridSize={fontSize}
            fontSize={fontSize}
            fillColor={colors[index]}
            interactive={false}
            pivot={textPivot}
            anchor={textAnchor}
          />
        )}
      </animated.sprite>
    </container>
  );
}
