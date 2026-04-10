import {
  addEventListener,
  animated,
  getStageSize,
  type MouseEvent,
  useSoundEffect,
  type TouchEvent,
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

export function Backlog() {
  const stageSize = getStageSize();
  const scale = stageSize.width / 1920;
  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.opus');
  const backButtonSound = useSoundEffect('audio/back_style_5_001.opus');

  const { records, scrollOffset, maxScroll, showScrollbar, scrollbarHeight, scrollbarOffset, handleWheel, scrollToRatio, jumpToRecord, close } =
    useBacklog({
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

  const handleClose = () => {
    backButtonSound();
    close();
  };

  const handleJumpRequest = (record: BacklogRecord) => {
    uiActions.confirm('确定要跳转到这条历史记录吗？', () => {
      void jumpToRecord(record.id);
    });
  };

  return (
    <container scale={scale}>
      <sprite
        label="透明遮罩"
        src="ui/mask-transparent.png"
        onClick={(event) => {
          event.stopPropagation();
          handleClose();
        }}
      />
      <sprite label="历史背景" src="ui/backlog_bg.png" pivot={[0.5, 0.5]} x={960} y={540}>
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
                    onMouseEnter={hoverButtonSound}
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
            y={typeof scrollbarOffset === 'number' ? SCROLLBAR_Y + scrollbarOffset : scrollbarOffset.to((value) => SCROLLBAR_Y + value)}
            cursor="pointer"
            onMouseDown={handleScrollbarDragStart}
            onTouchStart={handleScrollbarDragStart}
            opacity={0.92}
          />
        )}
      </sprite>
    </container>
  );
}

interface BacklogRowProps {
  record: BacklogRecord;
  y: number;
  onJump: () => void;
  onMouseEnter: () => void;
}

function BacklogRow({ record, y, onJump, onMouseEnter }: BacklogRowProps) {
  const title = record.meta.kind === 'text' ? record.meta.speaker || '旁白' : '选择';
  const content = record.meta.kind === 'text' ? record.meta.text : record.meta.options.join(' / ');

  const [hovered, setHovered] = useState(false);

  return (
    <container y={y}>
      <container
        onMouseEnter={() => {
          onMouseEnter();
          setHovered(true);
        }}
        onMouseLeave={() => setHovered(false)}
        onClick={(event) => {
          event.stopPropagation();
          onJump();
        }}
        opacity={hovered ? 1 : 0.92}
      >
        <text text={title} fontSize={28} lineHeight={1.5} fillColor="#ffffff" x={0} y={14} cursor="pointer" />
        <text
          text={content}
          fontSize={28}
          lineHeight={1.5}
          boxWidth={CONTENT_WIDTH}
          boxHeight={62}
          fillColor="#f0f0f0"
          x={140}
          y={14}
          cursor="pointer"
        />
      </container>
    </container>
  );
}
