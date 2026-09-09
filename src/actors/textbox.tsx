import {
  type AutoTicketHandle,
  animated,
  Button,
  type Node,
  useAutoTicket,
  useBeforeHandleCommandCallback,
  useInterruptCallback,
  useIsAutoing,
  useIsSeeking,
  useIsSkipping,
  useNavigationState,
  useSpring,
  useTransition,
  useUiData,
} from '@momoyu-ink/kit';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useSnapshot } from 'valtio';
import type { StageTextBoxNvlUiData, StageTextBoxUiData, TextStyleUiData } from '../data/ui';
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

function resolveActiveAvatar(textboxState: TextBoxState): TextBoxAvatarConfig | null {
  const entry = textboxState.entries[textboxState.entries.length - 1];
  const character = entry?.name.trim() ?? '';
  const avatarName = entry?.avatarName.trim() ?? '';
  const globalAvatar = textboxState.avatar.enable ? textboxState.avatar : null;

  if (!character) {
    return globalAvatar;
  }

  // Prefer a named variant match, fall back to the unnamed default for this character.
  const matched =
    textboxState.avatarFor.findLast((a) => a.character === character && a.name && a.name === avatarName) ??
    textboxState.avatarFor.findLast((a) => a.character === character && !a.name);

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

interface NvlParagraphProps {
  entry: TextEntry;
  isCurrent: boolean;
  isPrevious: boolean;
  isPrinting: boolean;
  textWindowRef: RefObject<Node | null>;
  printMode: 'instant' | 'typewriter' | 'printer';
  printSpeed: number;
  boxWidth: number;
  textStyle: TextStyleUiData;
  pastColorEnabled: boolean;
  pastFillColor: string;
  pastFadeTime: number;
  cursorPosition: [number, number] | null;
  cursor: StageTextBoxNvlUiData['controls']['cursor'];
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
  printMode,
  printSpeed,
  boxWidth,
  textStyle,
  pastColorEnabled,
  pastFillColor,
  pastFadeTime,
  cursorPosition,
  cursor,
  onStart,
  onProgress,
  onFinish,
}: NvlParagraphProps) {
  const targetFillColor = !pastColorEnabled || isCurrent ? textStyle.fillColor : pastFillColor;
  const paragraphStyle = useSpring({
    fillColor: targetFillColor,
    config: { duration: pastColorEnabled && isPrevious ? pastFadeTime : 0 },
  });

  return (
    <animated.text
      label="NVL 对话内容"
      ref={isPrinting ? textWindowRef : undefined}
      text={entry.text}
      fontSize={textStyle.fontSize}
      lineHeight={textStyle.lineHeight}
      boxWidth={boxWidth}
      fillColor={paragraphStyle.fillColor}
      printMode={isPrinting ? printMode : 'instant'}
      printSpeed={printSpeed}
      indent={textStyle.indent}
      stroke={textStyle.stroke}
      shadow={textStyle.shadow}
      strokeColor={textStyle.strokeColor}
      strokeWidth={textStyle.strokeWidth}
      shadowColor={textStyle.shadowColor}
      shadowOffsetX={textStyle.shadowOffsetX}
      shadowOffsetY={textStyle.shadowOffsetY}
      shadowBlur={textStyle.shadowBlur}
      shadowWidth={textStyle.shadowWidth}
      onStart={isPrinting ? onStart : undefined}
      onProgress={isPrinting ? onProgress : undefined}
      onFinish={isPrinting ? onFinish : undefined}
      interactive={false}
    >
      {isPrinting && cursorPosition && cursor.enabled ? (
        <animation
          src={cursor.src}
          format="apng"
          tint={cursor.tint}
          x={cursorPosition[0] + cursor.offsetX}
          y={cursorPosition[1] + cursor.offsetY}
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
  const { textbox: advUi, textboxNVL: nvlUi } = useUiData('stage');
  const navState = useNavigationState();
  const hasOverlay = navState.overlayStack.length > 0;
  const activeAvatar = resolveActiveAvatar(textBoxState as TextBoxState);
  const layout = resolveTextLayout(advUi, activeAvatar);
  const currentEntry = textBoxState.entries[textBoxState.entries.length - 1];
  const advText = textBoxState.entries.map((entry) => entry.text).join('\n');
  const advTextStyle = { ...advUi.content.textStyle, ...textBoxState.textStyle };
  const nvlTextStyle = { ...nvlUi.content.textStyle, ...textBoxState.textStyle };
  const activeUi = textBoxState.mode === 'adv' ? advUi : nvlUi;
  const hoverUi = activeUi.controls.hover;
  const activeContent = textBoxState.mode === 'adv' ? advUi.content : nvlUi.content;
  const mergedPrintMode = textBoxState.printMode ?? activeContent.printMode;
  const mergedPrintSpeed = textBoxState.printSpeed ?? activeContent.printSpeed;
  const effectivePrintMode = skipping || seeking ? 'instant' : mergedPrintMode;
  const effectivePrintSpeed =
    effectivePrintMode === 'instant' ? mergedPrintSpeed : Math.max(1, mergedPrintSpeed * settings.text_speed);
  const advVisible = textBoxState.mode === 'adv' && textBoxState.visible && !hasOverlay;
  const nvlVisible = textBoxState.mode === 'nvl' && textBoxState.visible && !hasOverlay;
  const activePrintMode = advVisible || nvlVisible ? effectivePrintMode : 'instant';
  const nvlPanelStyle = useSpring({
    opacity: nvlVisible ? 1 : 0,
    immediate: skipping || seeking,
    config: { duration: nvlUi.visibilityFadeTime },
  });

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

  // Clear text before the next command is executed, unless the next command is
  // a optionAdd/optionShow — in that case keep the text so it remains visible
  // during the selection phase.
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
  }, [currentEntry?.text, textBoxState.mode]);

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
  }, [activePrintMode, autoing, currentEntry?.text, seeking, issueAutoTicket]);

  const controls = (controlsUi: StageTextBoxUiData['controls'] | StageTextBoxNvlUiData['controls']) =>
    buttonTransitions((style) => (
      <animated.container label="文本框按钮组" opacity={style.opacity}>
        <Button
          sprite={{ src: controlsUi.closeButton.fileNames }}
          x={controlsUi.closeButton.position.x}
          y={controlsUi.closeButton.position.y}
          anchor={controlsUi.closeButton.anchor}
          pivot={controlsUi.closeButton.pivot}
          onPress={() => {
            gameState.textbox.hideReason = 'manual';
            gameState.textbox.visible = false;
          }}
        />
        <container x={controlsUi.buttonsPosition.x} y={controlsUi.buttonsPosition.y}>
          {controlsUi.buttons.map((button) => (
            <Button
              key={`${button.action}-${button.position.x}-${button.position.y}`}
              sprite={{ src: button.fileNames }}
              x={button.position.x}
              y={button.position.y}
              anchor={button.anchor}
              pivot={button.pivot}
              text={button.text}
              textStyle={
                typeof button.color === 'string'
                  ? { fontSize: button.fontSize, glyphGridSize: button.fontSize, fillColor: button.color }
                  : (button.color.map((fillColor) => ({
                      fontSize: button.fontSize,
                      glyphGridSize: button.fontSize,
                      fillColor,
                    })) as [
                      { fontSize: number; glyphGridSize: number; fillColor: string },
                      { fontSize: number; glyphGridSize: number; fillColor: string },
                      { fontSize: number; glyphGridSize: number; fillColor: string },
                    ])
              }
              textOffsetX={button.textOffsetX}
              textOffsetY={button.textOffsetY}
              lockOn={
                button.lockOnActive &&
                ((button.action === TextBoxButton.AUTO && autoing) ||
                  (button.action === TextBoxButton.SKIP && skipping))
                  ? 'press'
                  : undefined
              }
              onPress={() => {
                onButtonClick(button.action as TextBoxButton);
              }}
            />
          ))}
        </container>
      </animated.container>
    ));

  return (
    <container label="文本框容器" visible interactive={textBoxState.visible && !hasOverlay && !seeking}>
      <sprite
        label="文本框"
        src={advUi.background.src}
        x={advUi.background.position.x}
        y={advUi.background.position.y}
        anchor={advUi.background.anchor}
        pivot={advUi.background.pivot}
        visible={advVisible}
        interactive={advVisible}
        {...resolveNineSlice(advUi.background)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {advVisible ? controls(advUi.controls) : null}

        {activeAvatar ? (
          <sprite
            label="文本框头像"
            src={activeAvatar.src}
            x={advUi.avatar.position.x + activeAvatar.offsetX}
            y={advUi.avatar.position.y + activeAvatar.offsetY}
            anchor={advUi.avatar.anchor}
            pivot={advUi.avatar.pivot}
          />
        ) : null}

        <container x={layout.textX} y={advUi.content.position.y}>
          <text
            label="对话内容"
            ref={advVisible ? textWindowRef : undefined}
            text={advText}
            fontSize={advTextStyle.fontSize}
            lineHeight={advTextStyle.lineHeight}
            boxWidth={layout.textWidth}
            boxHeight={advUi.content.boxHeight}
            fillColor={advTextStyle.fillColor}
            printMode={advVisible ? effectivePrintMode : 'instant'}
            printSpeed={effectivePrintSpeed}
            indent={advTextStyle.indent}
            stroke={advTextStyle.stroke}
            shadow={advTextStyle.shadow}
            strokeColor={advTextStyle.strokeColor}
            strokeWidth={advTextStyle.strokeWidth}
            shadowColor={advTextStyle.shadowColor}
            shadowOffsetX={advTextStyle.shadowOffsetX}
            shadowOffsetY={advTextStyle.shadowOffsetY}
            shadowBlur={advTextStyle.shadowBlur}
            shadowWidth={advTextStyle.shadowWidth}
            onStart={
              advVisible
                ? () => {
                    progress.current = 0;
                  }
                : undefined
            }
            onProgress={
              advVisible
                ? (value) => {
                    progress.current = value;
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
          {advVisible && curPos && advUi.controls.cursor.enabled ? (
            <animation
              src={advUi.controls.cursor.src}
              format="apng"
              tint={advUi.controls.cursor.tint}
              x={curPos[0] + advUi.controls.cursor.offsetX}
              y={curPos[1] + advUi.controls.cursor.offsetY}
            />
          ) : null}
        </container>
      </sprite>
      <sprite
        label="姓名框"
        src={advUi.nameBox.background.src}
        x={layout.nameBoxX}
        y={advUi.nameBox.background.position.y}
        anchor={advUi.nameBox.background.anchor}
        pivot={advUi.nameBox.background.pivot}
        visible={advVisible}
        {...resolveNineSlice(advUi.nameBox.background)}
        opacity={currentEntry?.name.length ? 1 : 0}
      >
        <text
          label="姓名"
          text={currentEntry?.name ?? ''}
          fontSize={advUi.nameBox.text.textStyle.fontSize}
          lineHeight={advUi.nameBox.text.textStyle.lineHeight}
          fillColor={advUi.nameBox.text.textStyle.fillColor}
          anchor={advUi.nameBox.text.anchor}
          pivot={advUi.nameBox.text.pivot}
          x={advUi.nameBox.text.position.x}
          y={advUi.nameBox.text.position.y}
          indent={advUi.nameBox.text.textStyle.indent}
          stroke={advUi.nameBox.text.textStyle.stroke}
          shadow={advUi.nameBox.text.textStyle.shadow}
          strokeColor={advUi.nameBox.text.textStyle.strokeColor}
          strokeWidth={advUi.nameBox.text.textStyle.strokeWidth}
          shadowColor={advUi.nameBox.text.textStyle.shadowColor}
          shadowOffsetX={advUi.nameBox.text.textStyle.shadowOffsetX}
          shadowOffsetY={advUi.nameBox.text.textStyle.shadowOffsetY}
          shadowBlur={advUi.nameBox.text.textStyle.shadowBlur}
          shadowWidth={advUi.nameBox.text.textStyle.shadowWidth}
        />
      </sprite>
      <animated.sprite
        label="NVL 文本框"
        src={nvlUi.background.src}
        x={nvlUi.background.position.x}
        y={nvlUi.background.position.y}
        anchor={nvlUi.background.anchor}
        pivot={nvlUi.background.pivot}
        opacity={nvlPanelStyle.opacity}
        interactive={nvlVisible}
        {...resolveNineSlice(nvlUi.background)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {nvlVisible ? controls(nvlUi.controls) : null}
        <vbox
          x={nvlUi.content.position.x}
          y={nvlUi.content.position.y}
          width={nvlUi.content.boxWidth}
          gap={textBoxState.paragraphGap ?? nvlUi.paragraphGap}
        >
          {textBoxState.entries.map((entry, index) => {
            const previousEntry = textBoxState.entries[index - 1];
            const isCurrent = index === textBoxState.entries.length - 1;
            const isPrevious = index === textBoxState.entries.length - 2;
            const showName =
              (textBoxState.showName ?? nvlUi.name.show) && entry.name && entry.name !== previousEntry?.name;
            const pastColorEnabled = textBoxState.pastColorEnabled ?? nvlUi.past.colorEnabled;
            const pastFillColor = textBoxState.pastFillColor ?? nvlUi.past.fillColor;
            const pastFadeTime = textBoxState.pastFadeTime ?? nvlUi.past.fadeTime;

            return (
              <vbox key={`${index}:${entry.name}:${entry.avatarName}`} width={nvlUi.content.boxWidth} gap={0}>
                {showName ? (
                  <text
                    label="NVL 姓名"
                    text={entry.name}
                    fontSize={nvlUi.name.textStyle.fontSize}
                    lineHeight={nvlUi.name.textStyle.lineHeight}
                    boxWidth={nvlUi.content.boxWidth}
                    fillColor={nvlUi.name.textStyle.fillColor}
                    printMode="instant"
                    indent={nvlUi.name.textStyle.indent}
                    stroke={nvlUi.name.textStyle.stroke}
                    shadow={nvlUi.name.textStyle.shadow}
                    strokeColor={nvlUi.name.textStyle.strokeColor}
                    strokeWidth={nvlUi.name.textStyle.strokeWidth}
                    shadowColor={nvlUi.name.textStyle.shadowColor}
                    shadowOffsetX={nvlUi.name.textStyle.shadowOffsetX}
                    shadowOffsetY={nvlUi.name.textStyle.shadowOffsetY}
                    shadowBlur={nvlUi.name.textStyle.shadowBlur}
                    shadowWidth={nvlUi.name.textStyle.shadowWidth}
                    interactive={false}
                  />
                ) : null}
                <NvlParagraph
                  entry={entry}
                  isCurrent={isCurrent}
                  isPrevious={isPrevious}
                  isPrinting={isCurrent && nvlVisible}
                  textWindowRef={textWindowRef}
                  printMode={effectivePrintMode}
                  printSpeed={effectivePrintSpeed}
                  boxWidth={nvlUi.content.boxWidth}
                  textStyle={nvlTextStyle}
                  pastColorEnabled={pastColorEnabled}
                  pastFillColor={pastFillColor}
                  pastFadeTime={pastFadeTime}
                  cursorPosition={curPos}
                  cursor={nvlUi.controls.cursor}
                  onStart={() => {
                    progress.current = 0;
                  }}
                  onProgress={(value) => {
                    progress.current = value;
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
      </animated.sprite>
    </container>
  );
}
