import {
  animated,
  Button,
  executePluginCommand,
  nextLine,
  useAutoBlocker,
  useIsSeeking,
  useSkipBlocker,
  useTransition,
} from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { useCallback, useEffect } from 'react';
import { gameState } from '../state/game';

// Screen center coordinates
const CENTER_X = 960;
const CENTER_Y = 540;
// Button dimensions and nine-slice settings
const BUTTON_WIDTH = 700;
const BUTTON_HEIGHT = 67;
const BUTTON_GAP = 23;
const NINESLICE_BOUNDS: [number, number, number, number] = [0.3, 0.3, 0.3, 0.3];
const PANEL_TRANSITION = {
  from: {
    opacity: 0,
    scale: 0.985,
    offsetY: 16,
  },
  enter: {
    opacity: 1,
    scale: 1,
    offsetY: 0,
  },
  leave: {
    opacity: 0,
    scale: 0.985,
    offsetY: 16,
  },
  config: {
    tension: 280,
    friction: 24,
  },
};

export function SelectionActor() {
  const selectionState = useSnapshot(gameState.selection);
  const seeking = useIsSeeking();

  // Block skip and auto entirely while selection is visible.
  // hold() checks blockers synchronously and stops auto/skip if active.
  const blockDuringSelection = useCallback(() => gameState.selection.visible, []);
  useSkipBlocker(blockDuringSelection);
  useAutoBlocker(blockDuringSelection);

  const handleSelect = (value: string | number) => {
    if (selectionState.saveTo) {
      executePluginCommand('scenario', {
        subCommand: 'setLocalVariable',
        name: selectionState.saveTo,
        value,
      });
    }

    gameState.selection.visible = false;
    gameState.selection.options.length = 0;
    gameState.selection.saveTo = undefined;
    // uncomment this if you want the textbox to reappear after selection
    // gameState.textbox.visible = true;
    void nextLine();
  };

  useEffect(() => {
    if (!seeking) {
      gameState.selection.visible = false;
      gameState.selection.options.length = 0;
      gameState.selection.saveTo = undefined;
    }
  }, [seeking]);

  const show = selectionState.visible && !seeking;
  const transitions = useTransition(show ? [0] : [], {
    keys: (item) => item,
    ...PANEL_TRANSITION,
  });

  if (!show) {
    return null;
  }

  return transitions((style, _) => {
    return (
      <animated.backdrop filters={[{ type: 'blur', radius: 4 }]} opacity={style.opacity} interactive={show}>
        <animated.sprite label="选择支遮罩" src="ui/mask-transparent.png" opacity={style.opacity} />
        <animated.vbox
          label="选择支容器"
          gap={BUTTON_GAP}
          pivot={[0.5, 0.5]}
          x={CENTER_X}
          y={style.offsetY.to((value) => CENTER_Y + value)}
          opacity={style.opacity}
          scale={style.scale}
          interactive={show}
        >
          {selectionState.options.map((option, index) => (
            <Button
              // biome-ignore lint/suspicious/noArrayIndexKey: options are static per show cycle
              key={index}
              label={`选项_${index}`}
              sprite={{
                src: ['ui/selection.png', 'ui/selection_hover.png', 'ui/selection_press.png'],
                mode: 'nineslice',
                bounds: NINESLICE_BOUNDS,
                targetWidth: BUTTON_WIDTH,
                targetHeight: BUTTON_HEIGHT,
              }}
              text={option.text}
              textStyle={{ fontSize: 32, glyphGridSize: 32, fillColor: '#ffffff' }}
              textAlign="center"
              onPress={() => handleSelect(option.value)}
            />
          ))}
        </animated.vbox>
      </animated.backdrop>
    );
  });
}
