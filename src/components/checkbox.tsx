import { Checkbox as KitCheckbox, type CheckboxProps as KitCheckboxProps } from '@momoyu-ink/kit';

export interface CheckboxProps extends Omit<KitCheckboxProps, 'checkedSprite' | 'uncheckedSprite'> {
  targetWidth?: number;
  targetHeight?: number;
  mode?: 'normal' | 'nineslice';
  bounds?: [number, number, number, number];
}

export function Checkbox({ targetWidth, targetHeight, mode, bounds, ...props }: CheckboxProps) {
  const spriteProps = { mode, bounds, targetWidth, targetHeight };

  return (
    <KitCheckbox
      {...props}
      uncheckedSprite={{
        ...spriteProps,
        src: ['ui/unchecked.png', 'ui/unchecked_hover.png', 'ui/unchecked_press.png'],
      }}
      checkedSprite={{
        ...spriteProps,
        src: ['ui/checked.png', 'ui/checked_hover.png', 'ui/checked_press.png'],
      }}
    />
  );
}
