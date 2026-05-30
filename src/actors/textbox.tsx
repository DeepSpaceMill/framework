import {
  animated,
  useAutoTicket,
  useBeforeHandleCommandCallback,
  type AutoTicketHandle,
  useIsSeeking,
  useInterruptCallback,
  useIsAutoing,
  useIsSkipping,
  useTransition,
  type Node,
  useNavigationState,
} from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gameState, type TextBoxAvatarConfig, type TextBoxState } from '../state/game';
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

const TEXTBOX_BUTTON_VISIBILITY_DELAY_MS = 80;
const TEXTBOX_BUTTON_FADE_DURATION_MS = 140;
const TEXTBOX_X = 206;
const TEXTBOX_Y = 830;
const TEXTBOX_CONTENT_X = 72;
const TEXTBOX_CONTENT_Y = 54;
const TEXTBOX_CONTENT_WIDTH = 1384;
const TEXTBOX_CONTENT_HEIGHT = 110;
const NAMEBOX_X = 278;
const NAMEBOX_Y = 794;
const AVATAR_X = 0;
const AVATAR_Y = 0;
const AVATAR_PIVOT: [number, number] = [0, 0];

function resolveActiveAvatar(textboxState: TextBoxState): TextBoxAvatarConfig | null {
  const character = textboxState.name.trim();
  const avatarName = textboxState.avatarName.trim();
  const globalAvatar = textboxState.avatar.enable ? textboxState.avatar : null;

  if (!character) {
    return globalAvatar;
  }

  // Prefer a named variant match, fall back to the unnamed default for this character
  const matched =
    textboxState.avatarFor.findLast(
      (a) => a.character === character && a.name !== undefined && a.name === avatarName,
    ) ?? textboxState.avatarFor.findLast((a) => a.character === character && a.name === undefined);

  return matched?.enable ? matched : globalAvatar;
}

function resolveTextLayout(avatar: TextBoxAvatarConfig | null) {
  if (!avatar) {
    return {
      textX: TEXTBOX_CONTENT_X,
      textWidth: TEXTBOX_CONTENT_WIDTH,
      nameBoxX: NAMEBOX_X,
    };
  }

  return {
    textX: TEXTBOX_CONTENT_X + avatar.spacing,
    textWidth: Math.max(0, TEXTBOX_CONTENT_WIDTH - avatar.spacing),
    nameBoxX: NAMEBOX_X + avatar.spacing,
  };
}

export function TextBoxActor({ onButtonClick }: TextBoxActorProps) {
  const autoing = useIsAutoing();
  const skipping = useIsSkipping();
  const seeking = useIsSeeking();
  const issueAutoTicket = useAutoTicket();
  const textWindowRef = useRef<Node>(null);
  const autoTicketRef = useRef<AutoTicketHandle | null>(null);
  const progress = useRef(1);
  const [isHovered, setIsHovered] = useState(false);

  const textBoxState = useSnapshot(gameState.textbox);
  const settings = useSnapshot(settingsState);
  const navState = useNavigationState();
  const hasOverlay = navState.overlayStack.length > 0;
  const activeAvatar = resolveActiveAvatar(textBoxState as TextBoxState);
  const layout = resolveTextLayout(activeAvatar);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const buttonsVisible = isHovered && textBoxState.visible && !hasOverlay;

  const buttonTransitions = useTransition(buttonsVisible ? [0] : [], {
    from: { opacity: 0 },
    enter: { opacity: 1, delay: TEXTBOX_BUTTON_VISIBILITY_DELAY_MS },
    leave: { opacity: 0 },
    config: {
      duration: TEXTBOX_BUTTON_FADE_DURATION_MS,
    },
  });

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

  const effectivePrintMode = skipping || seeking ? 'instant' : textBoxState.printMode;
  const effectivePrintSpeed =
    effectivePrintMode === 'instant'
      ? textBoxState.printSpeed
      : Math.max(1, textBoxState.printSpeed * settings.text_speed);

  useLayoutEffect(() => {
    if (!autoing || seeking) {
      return;
    }

    if (effectivePrintMode === 'instant' || textBoxState.text.length === 0) {
      return;
    }

    autoTicketRef.current?.cancel();
    autoTicketRef.current = issueAutoTicket({ label: 'textbox-printing' });
  }, [autoing, effectivePrintMode, seeking, issueAutoTicket, textBoxState.text]);

  return (
    <container
      label="文本框容器"
      visible={textBoxState.visible && !hasOverlay}
      interactive={textBoxState.visible && !hasOverlay && !seeking}
    >
      <sprite
        label="文本框"
        src="ui/textbox.png"
        x={TEXTBOX_X}
        y={TEXTBOX_Y}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {buttonTransitions((style) => (
          <animated.container label="文本框按钮组" opacity={style.opacity}>
            <Button
              fileNames={['ui/textbox_close.png', 'ui/textbox_close_hover.png', 'ui/textbox_close_press.png']}
              x={1466}
              y={18}
              onClick={() => {
                gameState.textbox.hideReason = 'manual';
                gameState.textbox.visible = false;
              }}
            />
            <container x={650} y={158}>
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
          </animated.container>
        ))}

        {activeAvatar ? (
          <sprite
            label="文本框头像"
            src={activeAvatar.src}
            x={AVATAR_X + activeAvatar.offsetX}
            y={AVATAR_Y + activeAvatar.offsetY}
            pivot={AVATAR_PIVOT}
          />
        ) : null}

        <container x={layout.textX} y={TEXTBOX_CONTENT_Y}>
          <text
            label="对话内容"
            ref={textWindowRef}
            text={textBoxState.text}
            fontSize={32}
            lineHeight={textBoxState.lineHeight}
            boxWidth={layout.textWidth}
            boxHeight={TEXTBOX_CONTENT_HEIGHT}
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
        x={layout.nameBoxX}
        y={NAMEBOX_Y}
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
