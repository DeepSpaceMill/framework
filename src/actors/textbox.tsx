import { addEventListener, type Node } from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { gameState } from '../state';
import { Button } from '../components/button';

interface TextBoxState {
  name: string;
  text: string;
  visible: boolean;
}

export interface TextBoxHandle {
  hide: () => void;
  show: () => void;
  finishPrinting: () => void;
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

export function useTextBox() {
  const snap = useSnapshot(gameState);
  const progress = useRef(0);

  useEffect(() => {
    return addEventListener('scenarionextline', (e) => {
      if (e.type === 'text') {
        gameState.textbox.name = e.leading || '';
        gameState.textbox.text = e.text || '';
      }
    });
  }, []);

  const hideTextBox = () => {
    gameState.textbox.visible = false;
  };

  const showTextBox = () => {
    gameState.textbox.visible = true;
  };

  return {
    textBoxState: snap.textbox,
    progress,
    hideTextBox,
    showTextBox,
  };
}

interface TextBoxActorProps {
  textBoxState: TextBoxState;
  progress: React.MutableRefObject<number>;
  onButtonClick: (button: TextBoxButton) => void;
  onHideTextBox: () => void;
}

export const TextBoxActor = forwardRef<TextBoxHandle, TextBoxActorProps>(
  ({ textBoxState, progress, onButtonClick, onHideTextBox }, ref) => {
    const textWindowRef = useRef<Node>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
    };

    const finishPrinting = () => {
      textWindowRef.current?.executeCommand({
        subCommand: 'finishPrinting',
      });
      progress.current = 1;
    };

    useImperativeHandle(ref, () => ({
      hide: () => onHideTextBox(),
      show: () => {}, // 显示逻辑由外部控制
      finishPrinting,
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
              console.log('Close button clicked');
              onHideTextBox();
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
  },
);
