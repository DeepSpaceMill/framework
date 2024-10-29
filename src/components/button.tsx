import { type HaiEvent, type HaiNodeAttributes, animated, useSpring } from '@hai/lib';
import React, { useState } from 'react';

export interface ButtonProps extends HaiNodeAttributes {
  fileName: string | string[];
  label?: string;
  animation?: boolean;
  text?: string;
  fontSize?: number;
  color?: string | string[];
  mode?: 'normal' | 'nineslice';
  bounds?: [number, number, number, number];
  targetWidth?: number;
  targetHeight?: number;
  onClick?: (e: HaiEvent) => void;
}

export function Button(props: ButtonProps) {
  const {
    fileName,
    label,
    animation = false,
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
    ...restProps
  } = props;

  const [pressed, setPressed] = useState(false);

  const [springs, api] = useSpring(() => ({
    from: {
      idle_opacity: 1,
      hover_opacity: 0,
      visible: true,
      click_opacity: 0,
    },
  }));

  const handleEnter = (evt: HaiEvent) => {
    if (evt.targetId === evt.currentTargetId) {
      evt.stopPropagation();
      return;
    }

    api.start({
      to: {
        idle_opacity: 0,
        hover_opacity: 1,
        click_opacity: +pressed,
        visible: !pressed,
      },
      immediate: !animation,
    });
  };

  const handleLeave = () => {
    setPressed(false);
    api.start({
      to: {
        idle_opacity: 1,
        hover_opacity: 0,
        click_opacity: 0,
        visible: true,
      },
      immediate: !animation,
    });
  };

  const handleMouseDown = () => {
    setPressed(true);
    api.start({
      to: {
        click_opacity: 1,
        visible: false,
      },
      immediate: !animation,
      config: {
        duration: 30,
      },
    });
  };

  const handleMouseUp = () => {
    setPressed(false);
    api.start({
      to: {
        click_opacity: 0,
        visible: true,
      },
      immediate: !animation,
      config: {
        duration: 30,
      },
    });
  };

  const filenames = Array.isArray(fileName)
    ? fileName
    : [`${fileName}.png`, `${fileName}_hover.png`, `${fileName}_click.png`];

  const colors = Array.isArray(color) ? color : [color, color, color];

  return (
    <container
      label={label}
      {...restProps}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleMouseUp}
      onClick={onClick}
      pivot={anchor}
      anchor={anchor}
    >
      <animated.sprite
        label="button_idle"
        src={filenames[0]}
        visible={springs.visible}
        opacity={springs.idle_opacity}
        cursor={'pointer'}
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
            fillColor={colors[0]}
            interactive={false}
            pivot={[0.5, 0.5]}
            anchor={[0.5, 0.5]}
          />
        )}
      </animated.sprite>
      <animated.sprite
        label="button_hover"
        src={filenames[1]}
        visible={springs.visible}
        opacity={springs.hover_opacity}
        interactive={false}
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
            fillColor={colors[1]}
            interactive={false}
            pivot={[0.5, 0.5]}
            anchor={[0.5, 0.5]}
          />
        )}
      </animated.sprite>
      <animated.sprite
        label="button_click"
        src={filenames[2]}
        opacity={springs.click_opacity}
        interactive={false}
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
            fillColor={colors[2]}
            interactive={false}
            pivot={[0.5, 0.5]}
            anchor={[0.5, 0.5]}
          />
        )}
      </animated.sprite>
    </container>
  );
}
