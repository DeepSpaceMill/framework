import { animated, type MouseEvent, type MoyuNodeAttributes, type TouchEvent } from '@momoyu-ink/kit';
import { type ButtonState, type UseButtonOptions, useButton } from '../hooks/useButton';

export interface ButtonProps extends MoyuNodeAttributes, Omit<UseButtonOptions, 'initialState' | 'customHandlers'> {
  /**
   * Button image file name(s).
   * - An array of three strings: [idle, hover, pressed]
   */
  fileNames: string[];
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
  textOffsetX?: number;
  textOffsetY?: number;
  /**
   * Color for the button text. Can be one of:
   * - A single string: Same color for all states
   * - An array of three strings: [idle, hover, pressed]
   */
  color?: string | string[];
  stroke?: boolean;
  shadow?: boolean | boolean[];
  strokeColor?: string | string[];
  strokeWidth?: number | number[];
  shadowColor?: string | string[];
  shadowOffsetX?: number | number[];
  shadowOffsetY?: number | number[];
  shadowBlur?: number | number[];
  shadowWidth?: number | number[];
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
    fileNames = [],
    label,
    text,
    fontSize,
    textOffsetX,
    textOffsetY,
    color,
    stroke,
    shadow,
    strokeColor,
    strokeWidth,
    shadowColor,
    shadowOffsetX,
    shadowOffsetY,
    shadowBlur,
    shadowWidth,
    onClick,
    anchor,
    pivot = anchor,
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
  const { handlers, getStateIndex } = useButton({
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

  const colors = Array.isArray(color) ? color : [color, color, color];
  const strokes = Array.isArray(stroke) ? stroke : [stroke, stroke, stroke];
  const strokeColors = Array.isArray(strokeColor) ? strokeColor : [strokeColor, strokeColor, strokeColor];
  const strokeWidths = Array.isArray(strokeWidth) ? strokeWidth : [strokeWidth, strokeWidth, strokeWidth];
  const shadows = Array.isArray(shadow) ? shadow : [shadow, shadow, shadow];
  const shadowColors = Array.isArray(shadowColor) ? shadowColor : [shadowColor, shadowColor, shadowColor];
  const shadowOffsetXs = Array.isArray(shadowOffsetX) ? shadowOffsetX : [shadowOffsetX, shadowOffsetX, shadowOffsetX];
  const shadowOffsetYs = Array.isArray(shadowOffsetY) ? shadowOffsetY : [shadowOffsetY, shadowOffsetY, shadowOffsetY];
  const shadowBlurs = Array.isArray(shadowBlur) ? shadowBlur : [shadowBlur, shadowBlur, shadowBlur];
  const shadowWidths = Array.isArray(shadowWidth) ? shadowWidth : [shadowWidth, shadowWidth, shadowWidth];

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
    <container label={label} {...restProps} {...handlers} pivot={pivot} anchor={anchor}>
      <animated.sprite
        label={`${label}_sprite`}
        src={fileNames[index]}
        cursor="pointer"
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
            x={textOffsetX}
            y={textOffsetY}
            fillColor={colors[index]}
            stroke={strokes[index]}
            strokeColor={strokeColors[index]}
            strokeWidth={strokeWidths[index]}
            shadow={shadows[index]}
            shadowColor={shadowColors[index]}
            shadowOffsetX={shadowOffsetXs[index]}
            shadowOffsetY={shadowOffsetYs[index]}
            shadowBlur={shadowBlurs[index]}
            shadowWidth={shadowWidths[index]}
            interactive={false}
            pivot={textPivot}
            anchor={textAnchor}
          />
        )}
      </animated.sprite>
    </container>
  );
}
