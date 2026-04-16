import { useRef, useState } from 'react';
import { useNavigation, useNavigationParams, animated, getStageSize, useSoundEffect, useTransition } from '@momoyu-ink/kit';
import { Button } from '../components/button';
import { uiActions } from '../state/ui';
import { useSaveLoad } from '../hooks/useSaveLoad';

interface SaveLoadParams {
  type: 'save' | 'load';
}

const SLOTS_PER_PAGE = 10;
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

export function SaveLoad() {
  const navigation = useNavigation();
  const params = useNavigationParams<SaveLoadParams>();
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

  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.opus');
  const backButtonSound = useSoundEffect('audio/back_style_5_001.opus');

  const [currentPage, setCurrentPage] = useState(0);

  const type = params?.type ?? 'save';
  const { slots, saveToSlot, loadFromSlot, deleteSaveSlot } = useSaveLoad();

  const requestClose = (afterClose?: () => void) => {
    pendingCloseActionRef.current = afterClose ?? (() => navigation.popOverlay());
    setShow(false);
  };

  const handleSlotAction = async (slotId: string) => {
    const slotName = slotId === 'auto-save' ? '快速存档' : `存档槽 ${slotId}`;
    const actionText = type === 'save' ? '保存到' : '读取';

    uiActions.confirm(`确定要${actionText}${slotName}吗？`, () => performSlotAction(slotId));
  };

  const performSlotAction = async (slotId: string) => {
    try {
      if (type === 'save') {
        await saveToSlot(slotId);

        if (slotId === 'auto-save') {
          uiActions.notify('快速存档保存成功');
        } else {
          uiActions.notify(`保存到存档槽 ${slotId} 成功`);
        }
      } else if (type === 'load') {
        const success = await loadFromSlot(slotId);

        const slotName = slotId === 'auto-save' ? '快速存档' : `存档槽 ${slotId}`;

        if (success) {
          uiActions.notify(`读取${slotName}成功`);

          requestClose(() => {
            if (navigation.getCurrentPage() === 'title') {
              navigation.navigate('stage', { isNewGame: false });
            }

            navigation.clearOverlays();
          });
        } else {
          uiActions.notify(`读取${slotName}失败`);
        }
      }
    } catch (error) {
      console.error(`${type} operation failed:`, error);
      uiActions.notify(`${type === 'save' ? '保存' : '读取'}失败`);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteSaveSlot(slotId);
      uiActions.notify(`删除存档槽 ${slotId} 成功`);
    } catch (error) {
      console.error('Delete slot failed:', error);
      uiActions.notify(`删除存档槽 ${slotId} 失败`);
    }
  };

  const handleExit = () => {
    backButtonSound();
    requestClose();
  };

  const stageSize = getStageSize();
  const scale = stageSize.width / 1920;

  return transitions((style, _) => (
    <animated.backdrop filters={[{ type: 'blur', radius: 4 }]} opacity={style.opacity} scale={scale} interactive={show}>
      <animated.sprite label="透明遮罩" src="ui/mask-transparent.png" onClick={handleExit} />
      <animated.sprite
        label="背景图"
        src="ui/sl_bg.png"
        pivot={[0.5, 0.5]}
        x={960}
        y={style.offsetY.to((value) => 540 + value)}
        opacity={style.opacity}
        scale={style.scale}
      >
        <text label="标题" text={type?.toUpperCase()} fontSize={48} fillColor="white" x={64} y={54} />
        <Button
          fileNames={['ui/sl_close.png', 'ui/sl_close_hover.png', 'ui/sl_close_press.png']}
          x={1532}
          y={62}
          onClick={handleExit}
        />
        <container x={606} y={60}>
          {[...Array(5)].map((_, index) => (
            <Button
              key={`nav-button-${String(index)}`}
              fileNames={['ui/sl_nav.png', 'ui/sl_nav_hover.png', 'ui/sl_nav_press.png']}
              x={78 * index}
              text={`${index + 1}`}
              color={currentPage === index ? 'black' : 'white'}
              lockOn={currentPage === index ? 'press' : undefined}
              onClick={() => {
                setCurrentPage(index);
              }}
            />
          ))}
        </container>
        <container x={94} y={146}>
          {[...Array(10)].map((_, index) => {
            const slotId =
              currentPage === 0 && index === 0
                ? 'auto-save'
                : `save-${currentPage * SLOTS_PER_PAGE + index + (currentPage === 0 ? 0 : 1)}`;
            const slotData = slots.get(slotId);
            const isInteractive = !!slotData || type === 'save';
            const positionData = [
              [0, 0],
              [722, 0],
              [0, 140],
              [722, 140],
              [0, 280],
              [722, 280],
              [0, 420],
              [722, 420],
              [0, 560],
              [722, 560],
            ][index] || [0, 0];

            return (
              <container key={slotId} x={positionData[0]} y={positionData[1]}>
                <Button
                  fileNames={['ui/sl_item.png', 'ui/sl_item_hover.png', 'ui/sl_item_press.png']}
                  onMouseEnter={hoverButtonSound}
                  interactive={isInteractive}
                  onClick={() => handleSlotAction(slotId)}
                />
                {!slotData && (
                  <container interactive={false}>
                    <text
                      text="NO DATA"
                      fontSize={32}
                      lineHeight={1.5}
                      fillColor="#ffffff"
                      opacity={0.6}
                      pivot={[0.5, 0.5]}
                      x={712 / 2}
                      y={130 / 2}
                    />
                  </container>
                )}
                {slotData && (
                  <container>
                    <container interactive={false}>
                      <sprite src={slotData.snapshot} x={2} y={2} />
                      <text
                        text={`${slotData.name === 'auto-save' ? '（快速存档）' : slotData.name.replace('save-', '存档 ')}`}
                        fontSize={28}
                        lineHeight={1.2}
                        fillColor="#ffffff"
                        x={250}
                        y={7}
                      />
                      <text
                        text={slotData.extra?.text ?? ''}
                        fontSize={20}
                        lineHeight={1.3}
                        boxWidth={442}
                        boxHeight={52}
                        fillColor="#ffffff"
                        x={250}
                        y={50}
                      />
                      <text
                        text={formatTimestamp(slotData.metadata.timestamp)}
                        fontSize={16}
                        lineHeight={1.2}
                        fillColor="#ffffff"
                        pivot={[1, 0]}
                        x={689}
                        y={104}
                      />
                    </container>
                    {type === 'load' && (
                      <Button
                        fileNames={['ui/sl_item_del.png', 'ui/sl_item_del_hover.png', 'ui/sl_item_del_press.png']}
                        x={676}
                        y={15}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlot(slotId);
                        }}
                      />
                    )}
                  </container>
                )}
              </container>
            );
          })}
        </container>
      </animated.sprite>
    </animated.backdrop>
  ));
}

// we do not have Intl support in the engine yet, so use this simple formatter
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}
