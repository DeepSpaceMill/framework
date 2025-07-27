import {
  type MoyuEvent,
  type MoyuNodeAttributes,
  type MouseEvent,
  type TouchEvent,
  animated,
  useSpring,
} from '@momoyu-ink/kit';
import React from 'react';
import {
  useButton,
  type ButtonState,
  type UseButtonOptions,
} from '../hooks/useButton';

export interface ButtonProps
  extends MoyuNodeAttributes,
    Omit<UseButtonOptions, 'initialState' | 'customHandlers'> {
  /**
   * Button image file name(s). Can be one of:
   * - A single string: Will append .png, _hover.png, _click.png
   * - An array of three strings: [idle, hover, pressed]
   */
  fileName: string | string[];
  /**
   * Optional label for the button (accessibility)
   */
  label?: string;
  /**
   * Text to display on the button
   */
  text?: string;
  /**
   * Font size for the button text
   */
  fontSize?: number;
  /**
   * Color for the button text. Can be one of:
   * - A single string: Same color for all states
   * - An array of three strings: [idle, hover, pressed]
   */
  color?: string | string[];
  /**
   * Button rendering mode
   */
  mode?: 'normal' | 'nineslice';
  /**
   * Nineslice bounds [left, top, right, bottom]
   */
  bounds?: [number, number, number, number];
  /**
   * Target width for the button
   */
  targetWidth?: number;
  /**
   * Target height for the button
   */
  targetHeight?: number;
  /**
   * Lock button in a specific state
   */
  lockOn?: ButtonState;
  /**
   * Text alignment within the button
   */
  textAlign?: 'left' | 'center' | 'right';
  /**
   * Additional event handlers
   */
  onMouseEnter?: (evt: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onMouseDown?: (e: MouseEvent) => void;
  onMouseUp?: (e: MouseEvent) => void;
  onTouchStart?: (e: TouchEvent) => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onTouchCancel?: (e: TouchEvent) => void;
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
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    ...restProps
  } = props;

  // Pass all event handlers as customHandlers
  const { buttonState, handlers, getStateIndex } = useButton({
    lockOn,
    onClick,
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

  const filenames = Array.isArray(fileName)
    ? fileName
    : [`${fileName}.png`, `${fileName}_hover.png`, `${fileName}_click.png`];

  const colors = Array.isArray(color) ? color : [color, color, color];

  const index = getStateIndex();
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
      {...handlers}
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
