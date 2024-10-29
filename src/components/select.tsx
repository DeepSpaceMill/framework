import { type HaiEvent, type HaiNodeAttributes, animated, useSpring } from '@hai/lib';
import React, { useState } from 'react';
import { Button } from './button';

export interface SelectProps extends HaiNodeAttributes {
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
    tint,
    mode,
    bounds,
    targetWidth = 0,
    targetHeight = 0,
    ...restProps
  } = props;

  const [active, setActive] = useState(false);

  const filenames = Array.isArray(fileName)
    ? fileName
    : [`${fileName}.png`, `${fileName}_hover.png`, `${fileName}_click.png`];

  const colors = Array.isArray(color) ? color : [color, color, color];

  const currentOption = options.find((option) => option.value === props.value);

  return (
    <container label={label} {...restProps} pivot={anchor} anchor={anchor}>
      <Button
        fileName={filenames}
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
          src="new2/idle.png"
          mode="nineslice"
          bounds={[0.25, 0.25, 0.25, 0.25]}
          targetWidth={targetWidth}
          targetHeight={(targetHeight * (options.length + 0.5)) << 0}
          y={targetHeight + 10}
        >
          {options.map((option, index) => (
            <Button
              key={option.value}
              fileName={['new2/idle2.png', 'new2/hover2.png', 'new2/press2.png']}
              text={option.text}
              fontSize={fontSize}
              color={colors}
              mode="nineslice"
              bounds={[0.25, 0.25, 0.25, 0.25]}
              targetWidth={targetWidth - 6}
              targetHeight={targetHeight}
              onClick={(e) => {
                onSelect?.(option.value, option.text);
                setActive(false);
              }}
              pivot={[0.5, 0]}
              anchor={[0.5, 0]}
              textAlign="center"
              y={(targetHeight * (index + 0.25)) << 0}
              lockOn={props.value === option.value ? 'press' : undefined}
            />
          ))}
        </sprite>
      )}
    </container>
  );
}
