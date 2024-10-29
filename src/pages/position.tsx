import type { Cursor, HaiEvent } from '@hai/lib';
import React, { useRef, useState } from 'react';
import { CONTENT_HEIGHT, CONTENT_WIDTH, SIDEBAR_WIDTH, SMALL_TEXT_STYLE } from '../constants';

const BOX_X = CONTENT_WIDTH * 0.05 + SIDEBAR_WIDTH;
const BOX_Y = 20;

export function Position() {
  const [size, setSize] = useState({ width: CONTENT_WIDTH * 0.9, height: 200 });
  const [cursor, setCursor] = useState<Cursor>('default');
  const state = useRef({ pressed: false });

  const handleMouseDown = (event: HaiEvent) => {
    const x = (event.clientX ?? 0) - BOX_X;
    const y = (event.clientY ?? 0) - BOX_Y;
    if (x >= 0 && x <= size.width && y >= 0 && y <= size.height) {
      state.current.pressed = true;
      console.log('pressed');
    }
  };

  const handleMouseUp = () => {
    state.current.pressed = false;
  };

  const handleMouseMove = (event: HaiEvent) => {
    console.log('over', event.targetLabel);
    if (state.current.pressed) {
      setSize({
        width: (event.clientX ?? 0) - BOX_X,
        height: (event.clientY ?? 0) - BOX_Y,
      });
    } else {
      const x = (event.clientX ?? 0) - BOX_X;
      const y = (event.clientY ?? 0) - BOX_Y;

      if (x >= size.width - 10 && x <= size.width + 10 && y >= size.height - 10 && y <= size.height + 10) {
        console.log('se-resize');
        setCursor('se-resize');
      } else if (x >= size.width - 10 && x <= size.width + 10 && y >= 0 && y <= size.height) {
        console.log('e-resize');
        setCursor('e-resize');
      } else if (y >= size.height - 10 && y <= size.height + 10 && x >= 0 && x <= size.width) {
        console.log('s-resize');
        setCursor('s-resize');
      } else {
        console.log('default');
        setCursor('default');
      }
    }
  };

  const pivot_x = 0.5;
  const pivot_y = 0.0;

  return (
    <container
      x={CONTENT_WIDTH * 0.05}
      y={BOX_Y}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <sprite
        label="bottom"
        src="white.png"
        scaleX={CONTENT_WIDTH * 0.9}
        scaleY={CONTENT_HEIGHT * 0.9}
        tint="rgba(0, 0, 0, 0.2)"
        cursor={cursor}
      />
      <sprite
        label="middle"
        src="white.png"
        x={pivot_x * size.width}
        y={pivot_y * size.height}
        scaleX={size.width}
        scaleY={size.height}
        tint="rgba(152, 195, 121, 0.8)"
        pivot={[pivot_x, pivot_y]}
        cursor={cursor}
      >
        <sprite
          label="top"
          src="white.png"
          x={0 / size.width}
          y={20 / size.height}
          scaleX={100 / size.width}
          scaleY={100 / size.height}
          tint="rgba(255, 137, 75, 1.0)"
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
        >
          <sprite
            label="top2"
            src="white.png"
            x={0 / 100}
            y={-20 / 100}
            scaleX={10 / 100}
            scaleY={10 / 100}
            tint="rgba(255, 237, 175, 1.0)"
            pivot={[1.0, 0.0]}
            anchor={[1.0, 0.0]}
          />
          <text text="TEXT" scale={1 / 100} {...SMALL_TEXT_STYLE} pivot={[0.5, 0.5]} anchor={[0.5, 0.0]} />
        </sprite>
      </sprite>
    </container>
  );
}
