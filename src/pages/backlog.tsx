import {
  addEventListener,
  animated,
  executePluginCommand,
  getStageSize,
  type MouseEvent,
  useSoundEffect,
  useUiData,
  type TouchEvent,
  useTransition,
} from '@momoyu-ink/kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../components/button';
import type { BacklogUiData } from '../data/ui';
import { type BacklogRecord, useBacklog } from '../hooks/useBacklog';
import { uiActions } from '../state/ui';
const BACKLOG_VOICE_CHANNEL_PREFIX = 'voice:backlog';
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

async function replayBacklogVoice(speaker: string, voice: string, replayVoiceFailedMessage: string) {
  const channelName = speaker
    ? `${BACKLOG_VOICE_CHANNEL_PREFIX}:${speaker}`
    : `${BACKLOG_VOICE_CHANNEL_PREFIX}:default`;

  try {
    await executePluginCommand('audio', {
      subCommand: 'load',
      name: channelName,
      src: `voice/${voice}.opus`,
      settings: {
        autoPlay: false,
        volume: 1,
      },
    });

    await executePluginCommand('audio', {
      subCommand: 'play',
      name: channelName,
      fadeTime: 0,
    });
  } catch (error) {
    console.error('Failed to replay backlog voice:', error);
    uiActions.notify(replayVoiceFailedMessage);
  }
}

export function Backlog() {
  const backlogUi = useUiData('stage').backlog;
  const stageSize = getStageSize();
  const scale = stageSize.width / 1920;
  const backButtonSound = useSoundEffect(backlogUi.backButtonSound);
  const pendingCloseActionRef = useRef<(() => void) | null>(null);
  const [show, setShow] = useState(true);
  const viewport = backlogUi.panel.viewport;
  const innerViewportHeight = Math.max(0, viewport.height - viewport.paddingY * 2);
  const rowStep = backlogUi.list.itemHeight + backlogUi.list.itemGap;
  const transitions = useTransition(show ? [0] : [], {
    keys: (item) => item,
    ...PANEL_TRANSITION,
    onRest: () => {
      if (!show) {
        pendingCloseActionRef.current?.();
        pendingCloseActionRef.current = null;
      }
    },
  });

  const {
    records,
    scrollOffset,
    maxScroll,
    showScrollbar,
    scrollbarHeight,
    scrollbarOffset,
    handleWheel,
    scrollToRatio,
    jumpToRecord,
    close,
  } = useBacklog({
    itemHeight: rowStep,
    viewportHeight: innerViewportHeight,
    minScrollbarHeight: backlogUi.scrollbar.minHeight,
  });

  const draggingScrollbarRef = useRef(false);
  const dragStartClientYRef = useRef(0);
  const dragStartRatioRef = useRef(0);
  const scrollbarTravel = innerViewportHeight - scrollbarHeight;

  const handleScrollbarDragStart = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!showScrollbar || scrollbarTravel <= 0) return;

      event.stopPropagation();
      draggingScrollbarRef.current = true;
      dragStartClientYRef.current = event.clientY;
      dragStartRatioRef.current = maxScroll <= 0 ? 0 : scrollOffset.get() / maxScroll;
    },
    [maxScroll, scrollOffset, scrollbarTravel, showScrollbar],
  );

  const handleScrollbarDragMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!draggingScrollbarRef.current || scrollbarTravel <= 0) return;

      const deltaY = event.clientY - dragStartClientYRef.current;
      scrollToRatio(dragStartRatioRef.current + deltaY / scrollbarTravel, true);
    },
    [scrollToRatio, scrollbarTravel],
  );

  const handleScrollbarDragEnd = useCallback(() => {
    draggingScrollbarRef.current = false;
  }, []);

  useEffect(() => {
    const cleanups = [
      addEventListener('wheel', handleWheel),
      addEventListener('mousemove', handleScrollbarDragMove),
      addEventListener('touchmove', handleScrollbarDragMove),
      addEventListener('mouseup', handleScrollbarDragEnd),
      addEventListener('touchend', handleScrollbarDragEnd),
      addEventListener('touchcancel', handleScrollbarDragEnd),
    ];

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }, [handleScrollbarDragEnd, handleScrollbarDragMove, handleWheel]);

  const requestClose = useCallback(
    (afterClose?: () => void) => {
      pendingCloseActionRef.current = afterClose ?? close;
      setShow(false);
    },
    [close],
  );

  const handleClose = () => {
    backButtonSound();
    requestClose();
  };

  const handleJumpRequest = (record: BacklogRecord) => {
    uiActions.confirm(backlogUi.messages.confirmJump, () => {
      requestClose(() => {
        void jumpToRecord(record.id);
      });
    });
  };

  return transitions((style, _) => (
    <animated.backdrop filters={[{ type: 'blur', radius: 4 }]} opacity={style.opacity} scale={scale} interactive={show}>
      <animated.sprite
        label="透明遮罩"
        src={backlogUi.mask}
        onClick={(event) => {
          event.stopPropagation();
          handleClose();
        }}
      />
      <animated.sprite
        label="历史背景"
        src={backlogUi.background}
        pivot={[0.5, 0.5]}
        x={backlogUi.panel.position.x}
        y={style.offsetY.to((value) => backlogUi.panel.position.y + value)}
        opacity={style.opacity}
        scale={style.scale}
      >
        <text
          text={backlogUi.title.text}
          fontSize={backlogUi.title.textStyle.fontSize}
          lineHeight={backlogUi.title.textStyle.lineHeight}
          fillColor={backlogUi.title.textStyle.fillColor}
          indent={backlogUi.title.textStyle.indent}
          stroke={backlogUi.title.textStyle.stroke}
          shadow={backlogUi.title.textStyle.shadow}
          strokeColor={backlogUi.title.textStyle.strokeColor}
          strokeWidth={backlogUi.title.textStyle.strokeWidth}
          shadowColor={backlogUi.title.textStyle.shadowColor}
          shadowOffsetX={backlogUi.title.textStyle.shadowOffsetX}
          shadowOffsetY={backlogUi.title.textStyle.shadowOffsetY}
          shadowBlur={backlogUi.title.textStyle.shadowBlur}
          shadowWidth={backlogUi.title.textStyle.shadowWidth}
          x={backlogUi.title.position.x}
          y={backlogUi.title.position.y}
        />
        <Button
          fileNames={backlogUi.closeButton.fileNames}
          x={backlogUi.closeButton.position.x}
          y={backlogUi.closeButton.position.y}
          onClick={(event) => {
            event.stopPropagation();
            handleClose();
          }}
        />
        <container x={viewport.position.x} y={viewport.position.y}>
          <clip width={viewport.width} height={viewport.height}>
            <animated.container x={viewport.paddingX} y={scrollOffset.to((value) => viewport.paddingY - value)}>
              {records.length === 0 ? (
                <text
                  text={backlogUi.list.emptyState.text}
                  fontSize={backlogUi.list.emptyState.textStyle.fontSize}
                  lineHeight={backlogUi.list.emptyState.textStyle.lineHeight}
                  fillColor={backlogUi.list.emptyState.textStyle.fillColor}
                  indent={backlogUi.list.emptyState.textStyle.indent}
                  stroke={backlogUi.list.emptyState.textStyle.stroke}
                  shadow={backlogUi.list.emptyState.textStyle.shadow}
                  strokeColor={backlogUi.list.emptyState.textStyle.strokeColor}
                  strokeWidth={backlogUi.list.emptyState.textStyle.strokeWidth}
                  shadowColor={backlogUi.list.emptyState.textStyle.shadowColor}
                  shadowOffsetX={backlogUi.list.emptyState.textStyle.shadowOffsetX}
                  shadowOffsetY={backlogUi.list.emptyState.textStyle.shadowOffsetY}
                  shadowBlur={backlogUi.list.emptyState.textStyle.shadowBlur}
                  shadowWidth={backlogUi.list.emptyState.textStyle.shadowWidth}
                  opacity={backlogUi.list.emptyState.opacity}
                  x={backlogUi.list.emptyState.position.x}
                  y={backlogUi.list.emptyState.position.y}
                  pivot={backlogUi.list.emptyState.pivot}
                  anchor={backlogUi.list.emptyState.anchor}
                />
              ) : (
                records.map((record, index) => (
                  <BacklogRow
                    key={record.id}
                    record={record}
                    ui={backlogUi}
                    y={index * rowStep}
                    onJump={() => {
                      handleJumpRequest(record);
                    }}
                  />
                ))
              )}
            </animated.container>
          </clip>
        </container>
        {backlogUi.scrollbar.enabled && showScrollbar && (
          <animated.sprite
            src={backlogUi.scrollbar.src}
            mode="nineslice"
            bounds={backlogUi.scrollbar.bounds}
            targetWidth={backlogUi.scrollbar.width}
            targetHeight={scrollbarHeight}
            x={backlogUi.scrollbar.position.x}
            y={
              typeof scrollbarOffset === 'number'
                ? backlogUi.scrollbar.position.y + scrollbarOffset
                : scrollbarOffset.to((value) => backlogUi.scrollbar.position.y + value)
            }
            cursor="pointer"
            onMouseDown={handleScrollbarDragStart}
            onTouchStart={handleScrollbarDragStart}
            opacity={backlogUi.scrollbar.opacity}
          />
        )}
      </animated.sprite>
    </animated.backdrop>
  ));
}

interface BacklogRowProps {
  record: BacklogRecord;
  ui: BacklogUiData;
  y: number;
  onJump: () => void;
}

function BacklogRow({ record, ui, y, onJump }: BacklogRowProps) {
  let title = '';
  let content = '';
  let voice = '';

  switch (record.meta.kind) {
    case 'text': {
      title = record.meta.speaker || '';
      voice = record.meta.voice || '';

      if (title.length > 0) {
        content = `${ui.recordKinds.text.quoteLeft}${record.meta.text}${ui.recordKinds.text.quoteRight}`;
      } else {
        content = record.meta.text;
      }

      break;
    }
    case 'selection': {
      title = ui.recordKinds.selection.titleText;
      content = record.meta.options.join(' / ');
      break;
    }
  }

  const [hovered, setHovered] = useState<'text' | 'voice' | null>(null);
  const titleX = voice ? ui.item.title.position.x + ui.item.title.withVoiceOffsetX : ui.item.title.position.x;

  return (
    <container y={y}>
      <container
        onMouseLeave={() => setHovered(null)}
        onClick={(event) => {
          event.stopPropagation();
          onJump();
        }}
        opacity={hovered ? ui.item.hoverOpacity : ui.item.opacity}
      >
        {voice ? (
          <Button
            fileNames={ui.item.voiceButton.fileNames}
            label="Replay Voice"
            x={ui.item.voiceButton.position.x}
            y={ui.item.voiceButton.position.y}
            scale={1}
            tint={hovered === 'voice' ? ui.item.voiceButton.hoverTint : ui.item.voiceButton.idleTint}
            onMouseEnter={() => setHovered('voice')}
            onClick={(event) => {
              event.stopPropagation();
              void replayBacklogVoice(title, voice, ui.messages.replayVoiceFailed);
            }}
          />
        ) : null}
        <text
          label="text"
          text={title}
          fontSize={ui.item.title.textStyle.fontSize}
          lineHeight={ui.item.title.textStyle.lineHeight}
          fillColor={ui.item.title.textStyle.fillColor}
          indent={ui.item.title.textStyle.indent}
          stroke={ui.item.title.textStyle.stroke}
          shadow={ui.item.title.textStyle.shadow}
          strokeColor={ui.item.title.textStyle.strokeColor}
          strokeWidth={ui.item.title.textStyle.strokeWidth}
          shadowColor={ui.item.title.textStyle.shadowColor}
          shadowOffsetX={ui.item.title.textStyle.shadowOffsetX}
          shadowOffsetY={ui.item.title.textStyle.shadowOffsetY}
          shadowBlur={ui.item.title.textStyle.shadowBlur}
          shadowWidth={ui.item.title.textStyle.shadowWidth}
          x={titleX}
          y={ui.item.title.position.y}
          cursor="pointer"
          onMouseEnter={() => setHovered('text')}
        />
        <text
          label="text"
          text={content}
          fontSize={ui.item.content.textStyle.fontSize}
          lineHeight={ui.item.content.textStyle.lineHeight}
          boxWidth={ui.item.content.boxWidth}
          boxHeight={ui.item.content.boxHeight}
          fillColor={hovered === 'text' ? ui.item.content.hoverColor : ui.item.content.textStyle.fillColor}
          indent={ui.item.content.textStyle.indent}
          stroke={ui.item.content.textStyle.stroke}
          shadow={ui.item.content.textStyle.shadow}
          strokeColor={ui.item.content.textStyle.strokeColor}
          strokeWidth={ui.item.content.textStyle.strokeWidth}
          shadowColor={ui.item.content.textStyle.shadowColor}
          shadowOffsetX={ui.item.content.textStyle.shadowOffsetX}
          shadowOffsetY={ui.item.content.textStyle.shadowOffsetY}
          shadowBlur={ui.item.content.textStyle.shadowBlur}
          shadowWidth={ui.item.content.textStyle.shadowWidth}
          x={ui.item.content.position.x}
          y={ui.item.content.position.y}
          cursor="pointer"
          onMouseEnter={() => setHovered('text')}
        />
      </container>
    </container>
  );
}
