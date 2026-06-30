import {
  animated,
  useAutoTicket,
  useBeforeHandleCommandCallback,
  useIsSeeking,
  useInterruptCallback,
  useIsAutoing,
  useIsSkipping,
  useTransition,
  type AutoTicketHandle,
  type Node,
  useNavigationState,
  useUiData,
} from '@momoyu-ink/kit';
import { useSnapshot } from 'valtio';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gameState, type TextBoxAvatarConfig, type TextBoxState } from '../state/game';
import { settingsState } from '../state/settings';
import { Button } from '../components/button';
import type { StageTextBoxUiData } from '../data/ui';

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

function resolveActiveAvatar(textboxState: TextBoxState): TextBoxAvatarConfig | null {
  const character = textboxState.name.trim();
  const avatarName = textboxState.avatarName.trim();
  const globalAvatar = textboxState.avatar.enable ? textboxState.avatar : null;

  if (!character) {
    return globalAvatar;
  }

  // Prefer a named variant match, fall back to the unnamed default for this character.
  const matched =
    textboxState.avatarFor.findLast(
      (avatar) => avatar.character === character && avatar.name !== undefined && avatar.name === avatarName,
    ) ?? textboxState.avatarFor.findLast((avatar) => avatar.character === character && avatar.name === undefined);

  return matched?.enable ? matched : globalAvatar;
}

function resolveTextLayout(textBoxUi: StageTextBoxUiData, avatar: TextBoxAvatarConfig | null) {
  if (!avatar) {
    return {
      textX: textBoxUi.content.position.x,
      textWidth: textBoxUi.content.boxWidth,
      nameBoxX: textBoxUi.nameBox.background.position.x,
    };
  }

  const spacing = Math.max(0, avatar.spacing);

  return {
    textX: textBoxUi.content.position.x + spacing,
    textWidth: Math.max(0, textBoxUi.content.boxWidth - spacing),
    nameBoxX: textBoxUi.nameBox.background.position.x + spacing,
  };
}

function resolveNineSlice(imageConfig: StageTextBoxUiData['background']) {
  if (imageConfig.type === 'nineslice') {
    return {
      mode: 'nineslice' as const,
      bounds: imageConfig.bounds,
      targetWidth: imageConfig.targetWidth,
      targetHeight: imageConfig.targetHeight,
    };
  }

  return {};
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
  const textBoxUi = useUiData('stage').textbox;
  const navState = useNavigationState();
  const hasOverlay = navState.overlayStack.length > 0;
  const activeAvatar = resolveActiveAvatar(textBoxState as TextBoxState);
  const layout = resolveTextLayout(textBoxUi, activeAvatar);
  const mergedTextStyle = { ...textBoxUi.content.textStyle, ...textBoxState.textStyle };
  const mergedNameTextStyle = textBoxUi.nameBox.text.textStyle;
  const hoverUi = textBoxUi.controls.hover;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const buttonsVisible = (hoverUi.showOnHover ? isHovered : true) && textBoxState.visible && !hasOverlay;

  const buttonTransitions = useTransition(buttonsVisible ? [0] : [], {
    from: { opacity: 0 },
    enter: { opacity: 1, delay: hoverUi.visibilityDelayMs },
    leave: { opacity: 0 },
    config: {
      duration: hoverUi.fadeDurationMs,
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

  const mergedPrintMode = textBoxState.printMode ?? textBoxUi.content.printMode;
  const mergedPrintSpeed = textBoxState.printSpeed ?? textBoxUi.content.printSpeed;

  const effectivePrintMode = skipping || seeking ? 'instant' : mergedPrintMode;
  const effectivePrintSpeed =
    effectivePrintMode === 'instant' ? mergedPrintSpeed : Math.max(1, mergedPrintSpeed * settings.text_speed);

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
        src={textBoxUi.background.src}
        x={textBoxUi.background.position.x}
        y={textBoxUi.background.position.y}
        anchor={textBoxUi.background.anchor}
        pivot={textBoxUi.background.pivot}
        {...resolveNineSlice(textBoxUi.background)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {buttonTransitions((style) => (
          <animated.container label="文本框按钮组" opacity={style.opacity}>
            <Button
              fileNames={textBoxUi.controls.closeButton.fileNames}
              x={textBoxUi.controls.closeButton.position.x}
              y={textBoxUi.controls.closeButton.position.y}
              anchor={textBoxUi.controls.closeButton.anchor}
              onClick={() => {
                gameState.textbox.hideReason = 'manual';
                gameState.textbox.visible = false;
              }}
            />
            <container x={650} y={158}>
              {textBoxUi.controls.buttons.map((button) => (
                <Button
                  key={`${button.action}-${button.position.x}-${button.position.y}`}
                  fileNames={button.fileNames}
                  x={button.position.x}
                  y={button.position.y}
                  anchor={button.anchor}
                  text={button.text}
                  fontSize={button.fontSize}
                  color={button.color}
                  textOffsetX={button.textOffsetX}
                  textOffsetY={button.textOffsetY}
                  lockOn={
                    button.lockOnActive &&
                    ((button.action === TextBoxButton.AUTO && autoing) ||
                      (button.action === TextBoxButton.SKIP && skipping))
                      ? 'press'
                      : undefined
                  }
                  onClick={() => {
                    onButtonClick(button.action as TextBoxButton);
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
            x={textBoxUi.avatar.position.x + activeAvatar.offsetX}
            y={textBoxUi.avatar.position.y + activeAvatar.offsetY}
            pivot={textBoxUi.avatar.pivot}
          />
        ) : null}

        <container x={layout.textX} y={textBoxUi.content.position.y}>
          <text
            label="对话内容"
            ref={textWindowRef}
            text={textBoxState.text}
            fontSize={mergedTextStyle.fontSize}
            lineHeight={mergedTextStyle.lineHeight}
            boxWidth={layout.textWidth}
            boxHeight={textBoxUi.content.boxHeight}
            fillColor={mergedTextStyle.fillColor}
            printMode={effectivePrintMode}
            printSpeed={effectivePrintSpeed}
            indent={mergedTextStyle.indent}
            stroke={mergedTextStyle.stroke}
            shadow={mergedTextStyle.shadow}
            strokeColor={mergedTextStyle.strokeColor}
            strokeWidth={mergedTextStyle.strokeWidth}
            shadowColor={mergedTextStyle.shadowColor}
            shadowOffsetX={mergedTextStyle.shadowOffsetX}
            shadowOffsetY={mergedTextStyle.shadowOffsetY}
            shadowBlur={mergedTextStyle.shadowBlur}
            shadowWidth={mergedTextStyle.shadowWidth}
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
          {curPos && textBoxUi.controls.cursor.enabled ? (
            <animation
              src={textBoxUi.controls.cursor.src}
              format="apng"
              tint={textBoxUi.controls.cursor.tint}
              x={curPos[0] + textBoxUi.controls.cursor.offsetX}
              y={curPos[1] + textBoxUi.controls.cursor.offsetY}
            />
          ) : null}
        </container>
      </sprite>
      <sprite
        label="姓名框"
        src={textBoxUi.nameBox.background.src}
        x={layout.nameBoxX}
        y={textBoxUi.nameBox.background.position.y}
        anchor={textBoxUi.nameBox.background.anchor}
        pivot={textBoxUi.nameBox.background.pivot}
        {...resolveNineSlice(textBoxUi.nameBox.background)}
        opacity={textBoxState.name.length > 0 ? 1 : 0}
      >
        <text
          label="姓名"
          text={textBoxState.name}
          fontSize={mergedNameTextStyle.fontSize}
          lineHeight={mergedNameTextStyle.lineHeight}
          fillColor={mergedNameTextStyle.fillColor}
          anchor={textBoxUi.nameBox.text.anchor}
          pivot={textBoxUi.nameBox.text.pivot}
          x={textBoxUi.nameBox.text.position.x}
          y={textBoxUi.nameBox.text.position.y}
          indent={mergedNameTextStyle.indent}
          stroke={mergedNameTextStyle.stroke}
          shadow={mergedNameTextStyle.shadow}
          strokeColor={mergedNameTextStyle.strokeColor}
          strokeWidth={mergedNameTextStyle.strokeWidth}
          shadowColor={mergedNameTextStyle.shadowColor}
          shadowOffsetX={mergedNameTextStyle.shadowOffsetX}
          shadowOffsetY={mergedNameTextStyle.shadowOffsetY}
          shadowBlur={mergedNameTextStyle.shadowBlur}
          shadowWidth={mergedNameTextStyle.shadowWidth}
        />
      </sprite>
    </container>
  );
}
