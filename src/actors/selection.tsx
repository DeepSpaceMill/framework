import { executePluginCommand, nextLine, useSkipBlocker } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { useCallback } from 'react';
import { gameState } from '../state/game';
import { Button } from '../components/button';

// Vertical spacing between selection options (pixels)
const ITEM_SPACING = 90;
// Screen center coordinates
const CENTER_X = 960;
const CENTER_Y = 540;
// Button dimensions and nine-slice settings
const BUTTON_WIDTH = 700;
const BUTTON_HEIGHT = 67;
const NINESLICE_BOUNDS: [number, number, number, number] = [0.3, 0.3, 0.3, 0.3];

export function SelectionActor() {
  const selectionState = useSnapshot(gameState.selection);

  // Block skip (Ctrl fast-forward) entirely while selection is visible.
  // This covers the case where the user presses Ctrl after the selection appears.
  const blockSkipDuringSelection = useCallback(() => gameState.selection.visible, []);
  useSkipBlocker(blockSkipDuringSelection);

  const handleSelect = (value: string | number) => {
    if (selectionState.saveTo) {
      executePluginCommand('scenario', {
        subCommand: 'setVariable',
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

  // Vertically center the option list around the screen center
  const startY = CENTER_Y - ((selectionState.options.length - 1) * ITEM_SPACING) / 2;

  return (
    <container label="选择支容器" visible={selectionState.visible} interactive={selectionState.visible}>
      {selectionState.options.map((option, index) => (
        <Button
          // biome-ignore lint/suspicious/noArrayIndexKey: options are static per show cycle
          key={index}
          label={`选项_${index}`}
          fileNames={['ui/selection.png', 'ui/selection_hover.png', 'ui/selection_press.png']}
          mode="nineslice"
          bounds={NINESLICE_BOUNDS}
          targetWidth={BUTTON_WIDTH}
          targetHeight={BUTTON_HEIGHT}
          text={option.text}
          fontSize={32}
          color="#ffffff"
          textAlign="center"
          anchor={[0.5, 0.5]}
          x={CENTER_X}
          y={startY + index * ITEM_SPACING}
          onClick={() => handleSelect(option.value)}
        />
      ))}
    </container>
  );
}
