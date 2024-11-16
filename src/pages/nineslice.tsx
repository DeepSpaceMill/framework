import type { Cursor, HaiEvent } from '@doufu-moe/kit';
import React, { useRef, useState } from 'react';
import { CONTENT_HEIGHT, CONTENT_WIDTH, SIDEBAR_WIDTH, SMALL_TEXT_STYLE } from '../constants';

const BOX_X = CONTENT_WIDTH * 0.05 + SIDEBAR_WIDTH;
const BOX_Y = 20;

export function NineSlice() {
  const [size, setSize] = useState({ width: 400, height: 400 });
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

  return (
    <container
      x={CONTENT_WIDTH * 0.05}
      y={BOX_Y}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      cursor={cursor}
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
        src="nineslice-100-200-100.png"
        x={0}
        y={0}
        mode="nineslice"
        bounds={[0.25, 0.25, 0.25, 0.25]}
        targetWidth={size.width}
        targetHeight={size.height}
        cursor={cursor}
      />
    </container>
  );
}
