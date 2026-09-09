import {
  animated,
  Button,
  easings,
  useAutoTicket,
  type AutoTicketHandle,
  useBeforeHandleCommandCallback,
  useIsSeeking,
  useInterruptCallback,
  useIsAutoing,
  useIsSkipping,
  useSpring,
  useTransition,
  type Node,
  useNavigationState,
} from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { gameState, type TextBoxAvatarConfig, type TextBoxState, type TextEntry } from '../state/game';
import { settingsState } from '../state/settings';

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
const NVL_TEXTBOX_X = 50;
const NVL_TEXTBOX_Y = 24;
const NVL_CONTENT_X = 115;
const NVL_CONTENT_Y = 90;
const NVL_CONTENT_WIDTH = 1590;
const NVL_CONTENT_HEIGHT = 820;
const NVL_BUTTONS_X = 530;
const NVL_BUTTONS_Y = 956;
const NVL_VISIBILITY_DURATION_MS = 180;

function resolveActiveAvatar(textboxState: TextBoxState): TextBoxAvatarConfig | null {
  const entry = textboxState.entries[textboxState.entries.length - 1];
  const character = entry?.name.trim() ?? '';
  const avatarName = entry?.avatarName.trim() ?? '';
  const globalAvatar = textboxState.avatar.enable ? textboxState.avatar : null;

  if (!character) {
    return globalAvatar;
  }

  // Prefer a named variant match, fall back to the unnamed default for this character
  const matched =
    textboxState.avatarFor.findLast((a) => a.character === character && a.name && a.name === avatarName) ??
    textboxState.avatarFor.findLast((a) => a.character === character && !a.name);

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

interface NvlParagraphProps {
  entry: TextEntry;
  isCurrent: boolean;
  isPrevious: boolean;
  isPrinting: boolean;
  textWindowRef: RefObject<Node | null>;
  effectivePrintMode: 'instant' | 'typewriter' | 'printer';
  effectivePrintSpeed: number;
  textBoxState: TextBoxState;
  cursorPosition: [number, number] | null;
  onStart: () => void;
  onProgress: (progress: number) => void;
  onFinish: () => void;
}

function NvlParagraph({
  entry,
  isCurrent,
  isPrevious,
  isPrinting,
  textWindowRef,
  effectivePrintMode,
  effectivePrintSpeed,
  textBoxState,
  cursorPosition,
  onStart,
  onProgress,
  onFinish,
}: NvlParagraphProps) {
  const targetFillColor =
    !textBoxState.pastColorEnabled || isCurrent ? textBoxState.fillColor : textBoxState.pastFillColor;
  const paragraphStyle = useSpring({
    from: { fillColor: textBoxState.pastColorEnabled && isPrevious ? textBoxState.fillColor : targetFillColor },
    fillColor: targetFillColor,
    config: { duration: textBoxState.pastColorEnabled && isPrevious ? textBoxState.pastFadeTime : 0 },
  });

  return (
    <animated.text
      label="NVL 对话内容"
      ref={isPrinting ? textWindowRef : undefined}
      text={entry.text}
      fontSize={32}
      lineHeight={textBoxState.lineHeight}
      boxWidth={NVL_CONTENT_WIDTH}
      fillColor={paragraphStyle.fillColor}
      printMode={isPrinting ? effectivePrintMode : 'instant'}
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
      onStart={isPrinting ? onStart : undefined}
      onProgress={isPrinting ? onProgress : undefined}
      onFinish={isPrinting ? onFinish : undefined}
      interactive={false}
    >
      {isPrinting && cursorPosition ? (
        <animation
          src="cursor.apng"
          format="apng"
          tint="#999"
          x={cursorPosition[0] + 8}
          y={cursorPosition[1] + 10}
          interactive={false}
        />
      ) : null}
    </animated.text>
  );
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
  const currentEntry = textBoxState.entries[textBoxState.entries.length - 1];
  const advText = textBoxState.entries.map((entry) => entry.text).join('\n');
  const effectivePrintMode = skipping || seeking ? 'instant' : textBoxState.printMode;
  const effectivePrintSpeed =
    effectivePrintMode === 'instant'
      ? textBoxState.printSpeed
      : Math.max(1, textBoxState.printSpeed * settings.text_speed);
  const advVisible = textBoxState.mode === 'adv' && textBoxState.visible && !hasOverlay;
  const nvlVisible = textBoxState.mode === 'nvl' && textBoxState.visible && !hasOverlay;
  const activePrintMode = advVisible || nvlVisible ? effectivePrintMode : 'instant';
  const nvlPanelStyle = useSpring({
    opacity: nvlVisible ? 1 : 0,
    immediate: skipping || seeking,
    config: {
      duration: NVL_VISIBILITY_DURATION_MS,
      easing: easings.easeOutCubic,
    },
  });

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
      if (gameState.textbox.entries.length > 0) {
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

  // Keep ADV text visible through selection commands, then clear it before the next command.
  useBeforeHandleCommandCallback(({ command }) => {
    if (
      gameState.textbox.mode === 'adv' &&
      gameState.textbox.shouldClear &&
      command !== 'optionAdd' &&
      command !== 'optionShow'
    ) {
      gameState.textbox.entries.length = 0;
    }
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: we must reset curPos when text changes
  useEffect(() => {
    setCurPos(null);
  }, [currentEntry?.text]);

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

  useLayoutEffect(() => {
    if (!autoing || seeking) {
      return;
    }

    if (activePrintMode === 'instant' || !currentEntry?.text) {
      return;
    }

    autoTicketRef.current?.cancel();
    autoTicketRef.current = issueAutoTicket({ label: 'textbox-printing' });
  }, [activePrintMode, autoing, currentEntry?.text, issueAutoTicket, seeking]);

  const controls = (buttonsX: number, buttonsY: number, closeX: number, closeY: number) =>
    buttonTransitions((style) => (
      <animated.container label="文本框按钮组" opacity={style.opacity}>
        <Button
          sprite={{ src: ['ui/textbox_close.png', 'ui/textbox_close_hover.png', 'ui/textbox_close_press.png'] }}
          x={closeX}
          y={closeY}
          onPress={() => {
            gameState.textbox.hideReason = 'manual';
            gameState.textbox.visible = false;
          }}
        />
        <hbox x={buttonsX} y={buttonsY}>
          {[
            TextBoxButton.QSAVE,
            TextBoxButton.QLOAD,
            TextBoxButton.SAVE,
            TextBoxButton.LOAD,
            TextBoxButton.AUTO,
            TextBoxButton.SKIP,
            TextBoxButton.LOG,
            TextBoxButton.MENU,
          ].map((button) => (
            <Button
              key={button}
              sprite={{ src: 'ui/textbox_button.png' }}
              text={button}
              textStyle={[
                { fontSize: 24, glyphGridSize: 24, fillColor: 'rgba(255,255,255,0.3)' },
                { fontSize: 24, glyphGridSize: 24, fillColor: 'rgba(255,255,255,0.7)' },
                { fontSize: 24, glyphGridSize: 24, fillColor: 'rgba(255,255,255,0.9)' },
              ]}
              onPress={() => {
                onButtonClick(button);
              }}
            />
          ))}
        </hbox>
      </animated.container>
    ));

  return (
    <container
      label="文本框容器"
      visible={true}
      interactive={textBoxState.visible && !hasOverlay && !seeking}
    >
      <sprite
        label="文本框"
        src="ui/textbox.png"
        x={TEXTBOX_X}
        y={TEXTBOX_Y}
        visible={advVisible}
        interactive={advVisible}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {advVisible ? controls(650, 158, 1466, 18) : null}

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
            ref={advVisible ? textWindowRef : undefined}
            text={advText}
            fontSize={32}
            lineHeight={textBoxState.lineHeight}
            boxWidth={layout.textWidth}
            boxHeight={TEXTBOX_CONTENT_HEIGHT}
            fillColor={textBoxState.fillColor}
            printMode={advVisible ? effectivePrintMode : 'instant'}
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
            onStart={
              advVisible
                ? () => {
                    progress.current = 0;
                  }
                : undefined
            }
            onProgress={
              advVisible
                ? (v) => {
                    progress.current = v;
                  }
                : undefined
            }
            onFinish={
              advVisible
                ? () => {
                    progress.current = 1;
                    autoTicketRef.current?.done();
                    autoTicketRef.current = null;
                    showCurPos();
                  }
                : undefined
            }
            interactive={false}
          />
          {advVisible && curPos ? (
            <animation src="cursor.apng" format="apng" tint="#999" x={curPos[0] + 8} y={curPos[1] + 10} />
          ) : null}
        </container>
      </sprite>
      <sprite
        label="姓名框"
        src="ui/namebox.png"
        x={layout.nameBoxX}
        y={NAMEBOX_Y}
        visible={advVisible}
        opacity={currentEntry?.name.length ? 1 : 0}
      >
        <text
          label="姓名"
          text={currentEntry?.name ?? ''}
          fontSize={32}
          lineHeight={1.5}
          fillColor="#f0f0f0"
          anchor={[0.5, 0.5]}
          pivot={[0.5, 0.5]}
          x={0}
          y={0}
        />
      </sprite>
      <animated.sprite
        label="NVL 文本框"
        src="ui/textbox_nvl.png"
        x={NVL_TEXTBOX_X}
        y={NVL_TEXTBOX_Y}
        opacity={nvlPanelStyle.opacity}
        interactive={nvlVisible}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
          {nvlVisible ? controls(NVL_BUTTONS_X, NVL_BUTTONS_Y, 1720, 36) : null}
          <clip x={NVL_CONTENT_X} y={NVL_CONTENT_Y} width={NVL_CONTENT_WIDTH} height={NVL_CONTENT_HEIGHT}>
            <vbox width={NVL_CONTENT_WIDTH} gap={textBoxState.paragraphGap}>
              {textBoxState.entries.map((entry, index) => {
                const previousEntry = textBoxState.entries[index - 1];
                const isCurrent = index === textBoxState.entries.length - 1;
                const isPrevious = index === textBoxState.entries.length - 2;
                const showName = textBoxState.showName && entry.name && entry.name !== previousEntry?.name;

                return (
                  <vbox key={`${index}:${entry.name}:${entry.avatarName}`} width={NVL_CONTENT_WIDTH} gap={0}>
                    {showName ? (
                      <text
                        label="NVL 姓名"
                        text={entry.name}
                        fontSize={32}
                        lineHeight={textBoxState.lineHeight}
                        boxWidth={NVL_CONTENT_WIDTH}
                        fillColor={textBoxState.fillColor}
                        printMode="instant"
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
                        interactive={false}
                      />
                    ) : null}
                    <NvlParagraph
                      entry={entry}
                      isCurrent={isCurrent}
                      isPrevious={isPrevious}
                      isPrinting={isCurrent && nvlVisible}
                      textWindowRef={textWindowRef}
                      effectivePrintMode={effectivePrintMode}
                      effectivePrintSpeed={effectivePrintSpeed}
                      textBoxState={textBoxState as TextBoxState}
                      cursorPosition={curPos}
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
                    />
                  </vbox>
                );
              })}
            </vbox>
          </clip>
      </animated.sprite>
    </container>
  );
}
