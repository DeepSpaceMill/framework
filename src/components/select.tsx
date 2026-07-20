import { type MoyuNodeAttributes } from '@momoyu-ink/kit';
import { useState } from 'react';
import { Button } from './button';

export interface SelectProps extends MoyuNodeAttributes {
  fileName: string | string[];
  label?: string;
  value?: string;
  options?: SelectOption[];
  fontSize?: number;
  color?: string | string[];
  mode?: 'normal' | 'nineslice';
  bounds?: [number, number, number, number];
  targetWidth?: number;
  targetHeight?: number;
  onSelect?: (value: string, text: string) => void;
}

export interface SelectOption {
  text: string;
  value: string;
}

export function Select(props: SelectProps) {
  const {
    fileName,
    label,
    options = [],
    fontSize,
    color = 'black',
    onSelect,
    anchor,
    pivot = anchor,
    mode,
    bounds,
    targetWidth = 0,
    targetHeight = 0,
    ...restProps
  } = props;

  const [active, setActive] = useState(false);

  const _filenames = Array.isArray(fileName)
    ? fileName
    : [`${fileName}.png`, `${fileName}_hover.png`, `${fileName}_click.png`];

  const colors = Array.isArray(color) ? color : [color, color, color];

  const currentOption = options.find((option) => option.value === props.value);

  return (
    <container label={label} {...restProps} pivot={pivot} anchor={anchor}>
      <Button
        fileNames={['ui/dropdown.png', 'ui/dropdown_hover.png', 'ui/dropdown_hover.png']}
        text={currentOption?.text}
        fontSize={fontSize}
        color={colors}
        mode={mode}
        bounds={bounds}
        targetWidth={targetWidth}
        targetHeight={targetHeight}
        onClick={() => setActive(!active)}
        lockOn={active ? 'press' : undefined}
        textAlign="center"
      />
      {active && (
        <sprite
          src="ui/dropdown_list.png"
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={targetWidth}
          targetHeight={targetHeight * options.length + 3}
          y={targetHeight}
        >
          <vbox x={3}>
            {options.map((option) => (
              <Button
                key={option.value}
                fileNames={[
                  'ui/dropdown_listitem.png',
                  'ui/dropdown_listitem_hover.png',
                  'ui/dropdown_listitem_press.png',
                ]}
                text={option.text}
                fontSize={fontSize}
                color={colors}
                mode="nineslice"
                bounds={[0.25, 0.25, 0.25, 0.25]}
                targetWidth={targetWidth - 6}
                targetHeight={targetHeight}
                onClick={(_e) => {
                  onSelect?.(option.value, option.text);
                  setActive(false);
                }}
                textAlign="center"
                lockOn={props.value === option.value ? 'press' : undefined}
              />
            ))}
          </vbox>
        </sprite>
      )}
    </container>
  );
}
