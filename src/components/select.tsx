import { Select as KitSelect, type SelectProps as KitSelectProps } from '@momoyu-ink/kit';

export interface SelectProps extends Omit<KitSelectProps, 'list' | 'option' | 'options' | 'textStyle' | 'trigger'> {
  options?: KitSelectProps['options'];
  fontSize?: number;
  color?: string | readonly [string, string?, string?, string?];
  mode?: 'normal' | 'nineslice';
  bounds?: [number, number, number, number];
  targetWidth?: number;
  targetHeight?: number;
}

export function Select({
  options = [],
  fontSize,
  color = 'black',
  mode,
  bounds,
  targetWidth = 0,
  targetHeight = 0,
  ...props
}: SelectProps) {
  const createTextStyle = (fillColor: string) => ({ fontSize, glyphGridSize: fontSize, fillColor });
  const textStyle =
    typeof color === 'string'
      ? createTextStyle(color)
      : ([
          createTextStyle(color[0]),
          color[1] === undefined ? undefined : createTextStyle(color[1]),
          color[2] === undefined ? undefined : createTextStyle(color[2]),
          color[3] === undefined ? undefined : createTextStyle(color[3]),
        ] as const);

  return (
    <KitSelect
      {...props}
      options={options}
      trigger={{
        src: ['ui/dropdown.png', 'ui/dropdown_hover.png', 'ui/dropdown_hover.png'],
        mode,
        bounds,
        targetWidth,
        targetHeight,
      }}
      list={{
        src: 'ui/dropdown_list.png',
        mode: 'nineslice',
        bounds: [0.25, 0.25, 0.25, 0.25],
        targetWidth,
        paddingX: 3,
      }}
      option={{
        src: ['ui/dropdown_listitem.png', 'ui/dropdown_listitem_hover.png', 'ui/dropdown_listitem_press.png'],
        mode: 'nineslice',
        bounds: [0.25, 0.25, 0.25, 0.25],
        targetWidth: targetWidth - 6,
        targetHeight,
      }}
      textStyle={textStyle}
      textAlign="center"
    />
  );
}
