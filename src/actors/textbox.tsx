import {
  useAutoTicket,
  useBeforeHandleCommandCallback,
  useInterruptCallback,
  useIsAutoing,
  useIsSkipping,
  type AutoTicketHandle,
  type Node,
  useNavigationState,
} from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gameState } from '../state/game';
import { settingsState } from '../state/settings';
import { Button } from '../components/button';

export enum TextBoxButton {
  QSAVE = 'QSAV',
  QLOAD = 'QLOD',
  SAVE = 'SAVE',
  LOAD = 'LOAD',
  AUTO = 'AUTO',
  SKIP = 'SKIP',
  LOG = 'LOG',
  MENU = 'MENU',
}

interface TextBoxActorProps {
  onButtonClick: (button: TextBoxButton) => void;
}

export function TextBoxActor({ onButtonClick }: TextBoxActorProps) {
  const autoing = useIsAutoing();
  const skipping = useIsSkipping();
  const issueAutoTicket = useAutoTicket();
  const textWindowRef = useRef<Node>(null);
  const autoTicketRef = useRef<AutoTicketHandle | null>(null);
  const progress = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  const textBoxState = useSnapshot(gameState.textbox);
  const settings = useSnapshot(settingsState);
  const navState = useNavigationState();
  const hasOverlay = navState.overlayStack.length > 0;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const [curPos, setCurPos] = useState<[number, number] | null>(null);

  const showCurPos = useCallback(() => {
    try {
      const pos = textWindowRef.current?.executeCommand({
        subCommand: 'getCursorPosition',
      });
      if (gameState.textbox.text.length > 0) {
        setCurPos(pos as [number, number]);
      }
    } catch (error) {
      console.error('Error getting cursor position:', error);
    }
  }, []);

  // try to finish printing the text
  // return true if finished, false if already finished
  const tryFinishPrinting = useCallback(() => {
    if (progress.current < 1) {
      textWindowRef.current?.executeCommand({
        subCommand: 'finishPrinting',
      });
      progress.current = 1;
      return true;
    }
    return false;
  }, []);

  // Register interrupt callback so user clicks finish printing before advancing
  useInterruptCallback(tryFinishPrinting);

  // Clear text before the next command is executed, unless the next command is
  // a optionAdd/optionShow — in that case keep the text so it remains visible
  // during the selection phase.
  useBeforeHandleCommandCallback(({ command }) => {
    if (gameState.textbox.shouldClear && command !== 'optionAdd' && command !== 'optionShow') {
      gameState.textbox.text = '';
    }
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: we must reset curPos when text changes
  useEffect(() => {
    setCurPos(null);
  }, [textBoxState.text]);

  // Cancel ticket when auto stops; also clean up on unmount via the returned cleanup.
  useEffect(() => {
    if (autoing) {
      return () => {
        autoTicketRef.current?.cancel();
        autoTicketRef.current = null;
      };
    }
    autoTicketRef.current?.cancel();
    autoTicketRef.current = null;
  }, [autoing]);

  const effectivePrintMode = skipping ? 'instant' : textBoxState.printMode;
  const effectivePrintSpeed =
    effectivePrintMode === 'instant'
      ? textBoxState.printSpeed
      : Math.max(1, textBoxState.printSpeed * settings.text_speed);

  useLayoutEffect(() => {
    if (!autoing) {
      return;
    }

    if (effectivePrintMode === 'instant' || textBoxState.text.length === 0) {
      return;
    }

    autoTicketRef.current?.cancel();
    autoTicketRef.current = issueAutoTicket({ label: 'textbox-printing' });
  }, [autoing, effectivePrintMode, issueAutoTicket, textBoxState.text]);

  return (
    <container
      label="文本框容器"
      visible={textBoxState.visible && !hasOverlay}
      interactive={textBoxState.visible && !hasOverlay}
    >
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
        <container x={650} y={158} visible={isHovered}>
          {[
            TextBoxButton.QSAVE,
            TextBoxButton.QLOAD,
            TextBoxButton.SAVE,
            TextBoxButton.LOAD,
            TextBoxButton.AUTO,
            TextBoxButton.SKIP,
            TextBoxButton.LOG,
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

        <container x={72} y={54}>
          <text
            label="对话内容"
            ref={textWindowRef}
            text={textBoxState.text}
            fontSize={32}
            lineHeight={textBoxState.lineHeight}
            boxWidth={1384}
            boxHeight={110}
            fillColor={textBoxState.fillColor}
            printMode={effectivePrintMode}
            printSpeed={effectivePrintSpeed}
            indent={textBoxState.indent}
            stroke={textBoxState.stroke}
            shadow={textBoxState.shadow}
            strokeColor={textBoxState.strokeColor}
            strokeWidth={textBoxState.strokeWidth}
            shadowColor={textBoxState.shadowColor}
            shadowOffsetX={textBoxState.shadowOffsetX}
            shadowOffsetY={textBoxState.shadowOffsetY}
            shadowBlur={textBoxState.shadowBlur}
            shadowWidth={textBoxState.shadowWidth}
            onStart={() => {
              progress.current = 0;
            }}
            onProgress={(v) => {
              progress.current = v;
            }}
            onFinish={() => {
              progress.current = 1;
              autoTicketRef.current?.done();
              autoTicketRef.current = null;
              showCurPos();
            }}
            interactive={false}
          />
          {curPos ? (
            <animation src="cursor.apng" format="apng" tint="#999" x={curPos[0] + 8} y={curPos[1] + 10} />
          ) : null}
        </container>
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
}
