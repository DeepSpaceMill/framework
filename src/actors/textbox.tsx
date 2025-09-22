import { type Node } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { gameState } from '../state/game';
import { Button } from '../components/button';

export interface TextBoxHandle {
  tryFinishPrinting: () => void;
}

export enum TextBoxButton {
  QSAVE = 'QSAV',
  QLOAD = 'QLOD',
  SAVE = 'SAVE',
  LOAD = 'LOAD',
  AUTO = 'AUTO',
  // SKIP = 'SKIP',
  HIST = 'HIST',
  MENU = 'MENU',
}

interface TextBoxActorProps {
  onButtonClick: (button: TextBoxButton) => void;
}

export const TextBoxActor = forwardRef<TextBoxHandle, TextBoxActorProps>(({ onButtonClick }, ref) => {
  const textWindowRef = useRef<Node>(null);
  const progress = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  const textBoxState = useSnapshot(gameState.textbox);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // try to finish printing the text
  // return true if finished, false if already finished
  const tryFinishPrinting = () => {
    if (progress.current < 1) {
      textWindowRef.current?.executeCommand({
        subCommand: 'finishPrinting',
      });
      progress.current = 1;
      return true;
    }
    return false;
  };

  useImperativeHandle(ref, () => ({
    tryFinishPrinting,
  }));

  return (
    <container label="文本框容器" visible={textBoxState.visible} interactive={textBoxState.visible}>
      <sprite
        label="文本框"
        src="ui/textbox.png"
        x={206}
        y={830}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button
          fileNames={['ui/textbox_close.png', 'ui/textbox_close_hover.png', 'ui/textbox_close_press.png']}
          x={1466}
          y={18}
          onClick={() => {
            gameState.textbox.visible = false;
          }}
          visible={isHovered}
        />
        <container x={740} y={158} visible={isHovered}>
          {[
            TextBoxButton.QSAVE,
            TextBoxButton.QLOAD,
            TextBoxButton.SAVE,
            TextBoxButton.LOAD,
            TextBoxButton.AUTO,
            // TextBoxButton.SKIP,
            TextBoxButton.HIST,
            TextBoxButton.MENU,
          ].map((button, index) => (
            <Button
              key={button}
              fileNames={[`ui/textbox_button.png`, `ui/textbox_button.png`, `ui/textbox_button.png`]}
              x={100 * index}
              text={button}
              fontSize={24}
              color={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.9)']}
              onClick={() => {
                onButtonClick(button);
              }}
            />
          ))}
        </container>

        <text
          label="对话内容"
          ref={textWindowRef}
          text={textBoxState.text}
          fontSize={32}
          lineHeight={1.5}
          boxWidth={1384}
          boxHeight={110}
          fillColor="#f0f0f0"
          x={72}
          y={54}
          printMode="typewriter"
          printSpeed={20}
          onStart={() => {
            progress.current = 0;
          }}
          onProgress={(v) => {
            progress.current = v;
          }}
          onFinish={() => {
            progress.current = 1;
          }}
          interactive={false}
        />
      </sprite>
      <sprite
        label="姓名框"
        src="ui/namebox.png"
        x={278}
        y={794}
        anchor={[0.5, 0.5]}
        opacity={textBoxState.name.length > 0 ? 1 : 0}
      >
        <text
          label="姓名"
          text={textBoxState.name}
          fontSize={32}
          lineHeight={1.5}
          fillColor="#f0f0f0"
          anchor={[0.5, 0.5]}
          pivot={[0.5, 0.5]}
          x={0}
          y={0}
        />
      </sprite>
    </container>
  );
});
