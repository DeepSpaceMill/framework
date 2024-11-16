import type { HaiEvent } from '@doufu-moe/kit';
import React from 'react';
import { CONTENT_WIDTH, NORMAL_TEXT_STYLE } from '../constants';

const BOX_X = CONTENT_WIDTH * 0.05;
const BOX_Y = 220;

const BOX_WIDTH = CONTENT_WIDTH * 0.9;
const BOX_HEIGHT = 460;

export function MouseAndTouch() {
  const [location, setLocation] = React.useState({ x: 0, y: 0, clientX: 0, clientY: 0, screenX: 0, screenY: 0 });
  const [clickLocation, setClickLocation] = React.useState({ x: 0, y: 0 });

  const handleLocation = (event: HaiEvent) => {
    setLocation({
      x: Math.round((event.layerX ?? 0) * BOX_WIDTH),
      y: Math.round((event.layerY ?? 0) * BOX_HEIGHT),
      clientX: event.clientX ?? 0,
      clientY: event.clientY ?? 0,
      screenX: event.screenX ?? 0,
      screenY: event.screenY ?? 0,
    });
    setClickLocation({
      x: event.layerX ?? 0,
      y: event.layerY ?? 0,
    });
    event.preventDefault();
  };

  const handleClick = (event: HaiEvent) => {
    setClickLocation({
      x: event.layerX ?? 0,
      y: event.layerY ?? 0,
    });
    event.preventDefault();
  };

  return (
    <container x={BOX_X} y={20}>
      <sprite src="mask.png" scaleX={BOX_WIDTH} scaleY={200} />
      <text
        text={`x: ${location.x} y: ${location.y}\nclientX: ${location.clientX} clientY: ${location.clientY}\nscreenX: ${location.screenX} screenY: ${location.screenY}`.trim()}
        x={CONTENT_WIDTH * 0.05 + 10}
        y={30}
        boxWidth={CONTENT_WIDTH * 0.9}
        boxHeight={110}
        {...NORMAL_TEXT_STYLE}
      />

      <sprite
        src="mask.png"
        x={0}
        y={BOX_Y}
        scaleX={BOX_WIDTH}
        scaleY={BOX_HEIGHT}
        onMouseMove={handleLocation}
        onTouchStart={handleLocation}
        onTouchMove={handleLocation}
        onTouchEnd={handleClick}
        onMouseDown={handleClick}
        cursor="crosshair"
      >
        <sprite
          src="white.png"
          x={clickLocation.x}
          y={clickLocation.y}
          scaleX={10 / BOX_WIDTH}
          scaleY={10 / BOX_HEIGHT}
          opacity={0.6}
          pivot={[0.5, 0.5]}
          interactive={false}
        />
      </sprite>
    </container>
  );
}
