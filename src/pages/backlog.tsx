import {
  addEventListener,
  animated,
  executePluginCommand,
  getStageSize,
  type MouseEvent,
  useSoundEffect,
  type TouchEvent,
  useTransition,
} from '@momoyu-ink/kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../components/button';
import { type BacklogRecord, useBacklog } from '../hooks/useBacklog';
import { uiActions } from '../state/ui';

const PANEL_WIDTH = 1630;
const VIEWPORT_WIDTH = 1450;
const VIEWPORT_HEIGHT = 620;
const VIEWPORT_X = 90;
const VIEWPORT_Y = 166;
const VIEWPORT_PADDING_X = 22;
const VIEWPORT_PADDING_Y = 18;
const ROW_HEIGHT = 110;
const ROW_CARD_WIDTH = VIEWPORT_WIDTH - VIEWPORT_PADDING_X * 2;
const BUTTON_WIDTH = 42;
const CONTENT_WIDTH = ROW_CARD_WIDTH - BUTTON_WIDTH - 88;
const SCROLLBAR_WIDTH = 20;
const SCROLLBAR_X = VIEWPORT_X + VIEWPORT_WIDTH - SCROLLBAR_WIDTH - 8;
const SCROLLBAR_Y = VIEWPORT_Y + VIEWPORT_PADDING_Y;
const SCROLLBAR_BOUNDS: [number, number, number, number] = [0.34, 0.2, 0.34, 0.2];
const VOICE_BUTTON_X = 0;
const VOICE_BUTTON_Y = 8;
const VOICE_BUTTON_SCALE = 1;
const VOICE_TITLE_GAP = 44;
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

async function replayBacklogVoice(speaker: string, voice: string) {
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
    uiActions.notify('语音重播失败');
  }
}

export function Backlog() {
  const stageSize = getStageSize();
  const scale = stageSize.width / 1920;
  const backButtonSound = useSoundEffect('audio/back_style_5_001.opus');
  const pendingCloseActionRef = useRef<(() => void) | null>(null);
  const [show, setShow] = useState(true);
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
    itemHeight: ROW_HEIGHT,
    viewportHeight: VIEWPORT_HEIGHT - VIEWPORT_PADDING_Y * 2,
  });

  const draggingScrollbarRef = useRef(false);
  const dragStartClientYRef = useRef(0);
  const dragStartRatioRef = useRef(0);
  const scrollbarTravel = VIEWPORT_HEIGHT - VIEWPORT_PADDING_Y * 2 - scrollbarHeight;

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
    uiActions.confirm('确定要跳转到这个位置吗？', () => {
      requestClose(() => {
        void jumpToRecord(record.id);
      });
    });
  };

  return transitions((style, _) => (
    <animated.backdrop filters={[{ type: 'blur', radius: 4 }]} opacity={style.opacity} scale={scale} interactive={show}>
      <animated.sprite
        label="透明遮罩"
        src="ui/mask-transparent.png"
        onClick={(event) => {
          event.stopPropagation();
          handleClose();
        }}
      />
      <animated.sprite
        label="历史背景"
        src="ui/backlog_bg.png"
        pivot={[0.5, 0.5]}
        x={960}
        y={style.offsetY.to((value) => 540 + value)}
        opacity={style.opacity}
        scale={style.scale}
      >
        <text text="BACKLOG" fontSize={44} fillColor="#ffffff" x={104} y={72} />
        <Button
          fileNames={['ui/sl_close.png', 'ui/sl_close_hover.png', 'ui/sl_close_press.png']}
          x={PANEL_WIDTH - 98}
          y={60}
          onClick={(event) => {
            event.stopPropagation();
            handleClose();
          }}
        />
        <container x={VIEWPORT_X} y={VIEWPORT_Y}>
          <clip width={VIEWPORT_WIDTH} height={VIEWPORT_HEIGHT}>
            <animated.container x={VIEWPORT_PADDING_X} y={scrollOffset.to((value) => VIEWPORT_PADDING_Y - value)}>
              {records.length === 0 ? (
                <text
                  text="暂无历史记录"
                  fontSize={30}
                  fillColor="#ffffff"
                  opacity={0.72}
                  x={ROW_CARD_WIDTH / 2}
                  y={VIEWPORT_HEIGHT / 2 - 20}
                  pivot={[0.5, 0.5]}
                  anchor={[0.5, 0.5]}
                />
              ) : (
                records.map((record, index) => (
                  <BacklogRow
                    key={record.id}
                    record={record}
                    y={index * ROW_HEIGHT}
                    onJump={() => {
                      handleJumpRequest(record);
                    }}
                  />
                ))
              )}
            </animated.container>
          </clip>
        </container>
        {showScrollbar && (
          <animated.sprite
            src="ui/backlog_scrollbar.png"
            mode="nineslice"
            bounds={SCROLLBAR_BOUNDS}
            targetWidth={SCROLLBAR_WIDTH}
            targetHeight={scrollbarHeight}
            x={SCROLLBAR_X}
            y={
              typeof scrollbarOffset === 'number'
                ? SCROLLBAR_Y + scrollbarOffset
                : scrollbarOffset.to((value) => SCROLLBAR_Y + value)
            }
            cursor="pointer"
            onMouseDown={handleScrollbarDragStart}
            onTouchStart={handleScrollbarDragStart}
            opacity={0.92}
          />
        )}
      </animated.sprite>
    </animated.backdrop>
  ));
}

interface BacklogRowProps {
  record: BacklogRecord;
  y: number;
  onJump: () => void;
}

function BacklogRow({ record, y, onJump }: BacklogRowProps) {
  let title = '';
  let content = '';
  let voice = '';

  switch (record.meta.kind) {
    case 'text': {
      title = record.meta.speaker || '';
      voice = record.meta.voice || '';

      if (title.length > 0) {
        content = `「${record.meta.text}」`;
      } else {
        content = record.meta.text;
      }

      break;
    }
    case 'selection': {
      title = '选择';
      content = record.meta.options.join(' / ');
      break;
    }
  }

  const [hovered, setHovered] = useState<'text' | 'voice' | null>(null);
  const titleX = voice ? VOICE_TITLE_GAP : 0;

  return (
    <container y={y}>
      <container
        onMouseLeave={() => setHovered(null)}
        onClick={(event) => {
          event.stopPropagation();
          onJump();
        }}
        opacity={hovered ? 1 : 0.92}
      >
        {voice ? (
          <Button
            fileNames={['ui/backlog_voice.png', 'ui/backlog_voice.png', 'ui/backlog_voice.png']}
            label="Replay Voice"
            x={VOICE_BUTTON_X}
            y={VOICE_BUTTON_Y}
            scale={VOICE_BUTTON_SCALE}
            tint={hovered === 'voice' ? '#D18F52' : 'rgba(255, 255, 255, 0.92)'}
            onMouseEnter={() => setHovered('voice')}
            onClick={(event) => {
              event.stopPropagation();
              void replayBacklogVoice(title, voice);
            }}
          />
        ) : null}
        <text
          label="text"
          text={title}
          fontSize={28}
          lineHeight={1.5}
          fillColor="#ffffff"
          x={titleX}
          cursor="pointer"
          onMouseEnter={() => setHovered('text')}
        />
        <text
          label="text"
          text={content}
          fontSize={28}
          lineHeight={1.5}
          boxWidth={CONTENT_WIDTH}
          boxHeight={62}
          fillColor="#f0f0f0"
          tint={hovered === 'text' ? '#D18F52' : '#fff'}
          x={140}
          cursor="pointer"
          onMouseEnter={() => setHovered('text')}
        />
      </container>
    </container>
  );
}
