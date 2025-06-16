import {
  type MoyuNodeAttributes,
  type MouseEvent,
  type TouchEvent,
} from '@momoyu-ink/kit';
import React from 'react';
import { useButton } from '../hooks/useButton';

export interface CustomButtonProps extends MoyuNodeAttributes {
  /**
   * The content to display inside the button
   */
  children?: React.ReactNode;
  /**
   * Background color for idle state
   */
  idleColor?: string;
  /**
   * Background color for hover state
   */
  hoverColor?: string;
  /**
   * Background color for pressed state
   */
  pressColor?: string;
  /**
   * Callback when button is clicked
   */
  onClick?: (e: MouseEvent) => void;
  /**
   * Additional event handlers
   */
  onMouseEnter?: (evt: MouseEvent) => void;
  onMouseLeave?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: (e: MouseEvent) => void;
  onTouchStart?: () => void;
  onTouchEnd?: (e: TouchEvent) => void;
  onTouchCancel?: () => void;
}

/**
 * A completely custom button example using the useButton hook
 */
export function CustomButton(props: CustomButtonProps) {
  const {
    children,
    idleColor = '#3498db',
    hoverColor = '#2980b9',
    pressColor = '#1c6ea4',
    onClick,
    onMouseEnter,
    onMouseLeave,
    onMouseDown,
    onMouseUp,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    ...restProps
  } = props;

  const { buttonState, handlers } = useButton({
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

  // Determine background color based on button state
  const getBgColor = () => {
    switch (buttonState) {
      case 'hover':
        return hoverColor;
      case 'press':
        return pressColor;
      default:
        return idleColor;
    }
  };
  return (
    <container {...restProps} {...handlers}>
      {/* Custom button background */}
      <sprite src="new2/idle.png" tint={getBgColor()} cursor="pointer" />
      {/* Button content */}
      <container interactive={false}>{children}</container>
    </container>
  );
}
