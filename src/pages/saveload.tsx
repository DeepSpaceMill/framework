import { useEffect, useRef, useState } from 'react';
import { useNavigation, useNavigationParams, animated, getStageSize, useSoundEffect, useTransition, useUiData } from '@momoyu-ink/kit';
import { Button } from '../components/button';
import { uiActions } from '../state/ui';
import { useSaveLoad } from '../hooks/useSaveLoad';

interface SaveLoadParams {
  type?: 'save' | 'load';
}

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
  const saveLoadUi = useUiData('saveload');
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

  const hoverButtonSound = useSoundEffect(saveLoadUi.hoverButtonSound);
  const backButtonSound = useSoundEffect(saveLoadUi.backButtonSound);

  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = saveLoadUi.pageButtons.length;
  const slotsPerPage = saveLoadUi.slots.length;
  const activePage = Math.min(currentPage, pageCount - 1);

  const type = params?.type ?? saveLoadUi.defaultType;
  const titleText = type === 'save' ? saveLoadUi.title.saveText : saveLoadUi.title.loadText;
  const { slots, saveToSlot, loadFromSlot, deleteSaveSlot } = useSaveLoad();

  useEffect(() => {
    if (currentPage !== activePage) {
      setCurrentPage(activePage);
    }
  }, [activePage, currentPage]);

  const getSlotLabel = (slotId: string) => (slotId === 'auto-save' ? '快速存档' : `存档槽 ${slotId.replace('save-', '')}`);

  const requestClose = (afterClose?: () => void) => {
    pendingCloseActionRef.current = afterClose ?? (() => navigation.popOverlay());
    setShow(false);
  };

  const handleSlotAction = async (slotId: string) => {
    const slotName = getSlotLabel(slotId);
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
          uiActions.notify(`保存到${getSlotLabel(slotId)}成功`);
        }
      } else if (type === 'load') {
        const success = await loadFromSlot(slotId);

        const slotName = getSlotLabel(slotId);

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
      uiActions.notify(`删除${getSlotLabel(slotId)}成功`);
    } catch (error) {
      console.error('Delete slot failed:', error);
      uiActions.notify(`删除${getSlotLabel(slotId)}失败`);
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
      <animated.sprite label="透明遮罩" src={saveLoadUi.mask} onClick={handleExit} />
      <animated.sprite
        label="背景图"
        src={saveLoadUi.background}
        pivot={[0.5, 0.5]}
        x={960}
        y={style.offsetY.to((value) => 540 + value)}
        opacity={style.opacity}
        scale={style.scale}
      >
        <text
          label="标题"
          text={titleText}
          fontSize={saveLoadUi.title.fontSize}
          fillColor={saveLoadUi.title.color}
          x={saveLoadUi.title.position.x}
          y={saveLoadUi.title.position.y}
        />
        <Button
          fileNames={saveLoadUi.closeButton.fileNames}
          x={saveLoadUi.closeButton.position.x}
          y={saveLoadUi.closeButton.position.y}
          onClick={handleExit}
        />
        {saveLoadUi.pageButtons.map((button, index) => (
          <Button
            key={`nav-button-${String(index)}`}
            fileNames={button.fileNames}
            x={button.position.x}
            y={button.position.y}
            text={button.text ?? `${index + 1}`}
            fontSize={button.fontSize}
            color={activePage === index ? button.activeTextColor : button.inactiveTextColor}
            lockOn={activePage === index ? 'press' : undefined}
            onClick={() => {
              setCurrentPage(index);
            }}
          />
        ))}
        {saveLoadUi.slots.map((slot, index) => {
          const linearIndex = activePage * slotsPerPage + index;
          const isAutoSaveSlot = saveLoadUi.enableAutoSaveSlot && linearIndex === 0;
          const slotId = isAutoSaveSlot ? 'auto-save' : `save-${linearIndex + (saveLoadUi.enableAutoSaveSlot ? 0 : 1)}`;
          const slotData = slots.get(slotId);
          const isInteractive = !!slotData || type === 'save';

          return (
            <container key={slotId} x={slot.position.x} y={slot.position.y}>
              <Button
                fileNames={slot.fileNames}
                onMouseEnter={hoverButtonSound}
                interactive={isInteractive}
                onClick={() => handleSlotAction(slotId)}
              />
              {!slotData && saveLoadUi.slotContent.emptyText.enabled && (
                <container interactive={false}>
                  <text
                    text={saveLoadUi.slotContent.emptyText.text}
                    fontSize={saveLoadUi.slotContent.emptyText.fontSize}
                    lineHeight={1.5}
                    fillColor={saveLoadUi.slotContent.emptyText.color}
                    opacity={saveLoadUi.slotContent.emptyText.opacity}
                    pivot={[0.5, 0.5]}
                    x={saveLoadUi.slotContent.emptyText.position.x}
                    y={saveLoadUi.slotContent.emptyText.position.y}
                  />
                </container>
              )}
              {slotData && (
                <container>
                  <container interactive={false}>
                    <sprite
                      src={slotData.snapshot}
                      x={saveLoadUi.slotContent.snapshot.position.x}
                      y={saveLoadUi.slotContent.snapshot.position.y}
                    />
                    {saveLoadUi.slotContent.name.enabled && (
                      <text
                        text={slotData.name === 'auto-save' ? '（快速存档）' : `存档 ${slotData.name.replace('save-', '')}`}
                        fontSize={saveLoadUi.slotContent.name.fontSize}
                        lineHeight={1.2}
                        fillColor={saveLoadUi.slotContent.name.color}
                        x={saveLoadUi.slotContent.name.position.x}
                        y={saveLoadUi.slotContent.name.position.y}
                      />
                    )}
                    {saveLoadUi.slotContent.summary.enabled && (
                      <text
                        text={slotData.extra?.text ?? ''}
                        fontSize={saveLoadUi.slotContent.summary.fontSize}
                        lineHeight={1.3}
                        boxWidth={saveLoadUi.slotContent.summary.boxWidth}
                        boxHeight={saveLoadUi.slotContent.summary.boxHeight}
                        fillColor={saveLoadUi.slotContent.summary.color}
                        x={saveLoadUi.slotContent.summary.position.x}
                        y={saveLoadUi.slotContent.summary.position.y}
                      />
                    )}
                    {saveLoadUi.slotContent.timestamp.enabled && (
                      <text
                        text={formatTimestamp(slotData.metadata.timestamp)}
                        fontSize={saveLoadUi.slotContent.timestamp.fontSize}
                        lineHeight={1.2}
                        fillColor={saveLoadUi.slotContent.timestamp.color}
                        pivot={[1, 0]}
                        x={saveLoadUi.slotContent.timestamp.position.x}
                        y={saveLoadUi.slotContent.timestamp.position.y}
                      />
                    )}
                  </container>
                  {type === 'load' && (
                    <Button
                      fileNames={saveLoadUi.slotContent.deleteButton.fileNames}
                      x={saveLoadUi.slotContent.deleteButton.position.x}
                      y={saveLoadUi.slotContent.deleteButton.position.y}
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
