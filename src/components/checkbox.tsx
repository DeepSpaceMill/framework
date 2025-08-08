import type { MouseEvent, MoyuNodeAttributes } from '@momoyu-ink/kit';
import { Button } from './button';

export interface CheckboxProps extends Omit<MoyuNodeAttributes, 'onClick'> {
  /**
   * Whether the checkbox is checked
   */
  checked?: boolean;
  /**
   * Callback when checkbox state changes
   */
  onChange?: (checked: boolean) => void;
  /**
   * Optional label for the checkbox (accessibility)
   */
  label?: string;
  /**
   * Target width for the checkbox
   */
  targetWidth?: number;
  /**
   * Target height for the checkbox
   */
  targetHeight?: number;
  /**
   * Button rendering mode
   */
  mode?: 'normal' | 'nineslice';
  /**
   * Nineslice bounds [left, top, right, bottom]
   */
  bounds?: [number, number, number, number];
}

/**
 * Checkbox component based on the Button component
 * Uses ui/checked.png, ui/checked_hover.png, ui/checked_press.png for checked state
 * Uses ui/unchecked.png, ui/unchecked_hover.png, ui/unchecked_press.png for unchecked state
 */
export function Checkbox(props: CheckboxProps) {
  const { checked = false, onChange, label, targetWidth, targetHeight, mode, bounds, ...restProps } = props;

  const handleClick = (_e: MouseEvent) => {
    onChange?.(!checked);
  };

  // Choose the appropriate file names based on checked state
  const fileNames = checked
    ? ['ui/checked.png', 'ui/checked_hover.png', 'ui/checked_press.png']
    : ['ui/unchecked.png', 'ui/unchecked_hover.png', 'ui/unchecked_press.png'];

  return (
    <Button
      {...restProps}
      label={label}
      fileNames={fileNames}
      onClick={handleClick}
      targetWidth={targetWidth}
      targetHeight={targetHeight}
      mode={mode}
      bounds={bounds}
    />
  );
}
