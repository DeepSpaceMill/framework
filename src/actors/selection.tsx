import {
  animated,
  Button,
  executePluginCommand,
  nextLine,
  useAutoBlocker,
  useIsSeeking,
  useSkipBlocker,
  useSoundEffect,
  useTransition,
  useUiData,
} from '@momoyu-ink/kit';
import { useCallback, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { gameState } from '../state/game';

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
  const selectionUi = useUiData('stage').selection;
  const seeking = useIsSeeking();
  const hoverSound = useSoundEffect(selectionUi.hoverSound);
  const clickSound = useSoundEffect(selectionUi.clickSound);

  // Block skip and auto entirely while selection is visible.
  // hold() checks blockers synchronously and stops auto/skip if active.
  const blockDuringSelection = useCallback(() => gameState.selection.visible, []);
  useSkipBlocker(blockDuringSelection);
  useAutoBlocker(blockDuringSelection);

  const handleSelect = (value: string | number) => {
    clickSound();

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
      <animated.backdrop
        filters={[{ type: 'blur', radius: selectionUi.backdrop.blurRadius }]}
        opacity={style.opacity}
        interactive={show}
      >
        <animated.sprite label="选择支遮罩" src={selectionUi.backdrop.mask} opacity={style.opacity} />
        <animated.vbox
          label="选择支容器"
          gap={selectionUi.panel.gap}
          pivot={[0.5, 0.5]}
          x={selectionUi.panel.position.x}
          y={style.offsetY.to((value) => selectionUi.panel.position.y + value)}
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
                src: selectionUi.button.fileNames,
                mode: 'nineslice',
                bounds: selectionUi.button.bounds,
                targetWidth: selectionUi.button.targetWidth,
                targetHeight: selectionUi.button.targetHeight,
              }}
              text={option.text}
              textStyle={{ ...selectionUi.button.textStyle, glyphGridSize: selectionUi.button.textStyle.fontSize }}
              textAlign={selectionUi.button.textAlign}
              onMouseEnter={hoverSound}
              onPress={() => handleSelect(option.value)}
            />
          ))}
        </animated.vbox>
      </animated.backdrop>
    );
  });
}
