import { useContext, useEffect, useRef, useState } from 'react';
import { Button } from '../components/button';
import { Notification } from '../components/notification';
import { TEXT_COLOR } from '../constants';
import { EntryContext } from '../entry';
import { type NotificationHandle } from '../hooks/useNotification';
import { SaveSlot, useSaveLoad } from '../hooks/useSaveLoad';
import { useSoundEffect } from '../hooks/useSoundEffect';

export interface SaveLoadProps {
  type: 'save' | 'load';
}

export function SaveLoad(props: SaveLoadProps) {
  const context = useContext(EntryContext);

  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.ogg');
  const backButtonSound = useSoundEffect('audio/back_style_5_001.ogg');

  const [currentPage, setCurrentPage] = useState(0);
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const notificationRef = useRef<NotificationHandle>(null);

  const { type } = props;
  const { saveToSlot, loadFromSlot, getSaveSlots, deleteSaveSlot } = useSaveLoad();

  // Load save slots when component mounts
  useEffect(() => {
    const loadSaveSlots = async () => {
      try {
        const slots = await getSaveSlots();
        setSaveSlots(slots);
      } catch (error) {
        console.error('Failed to load save slots:', error);
      }
    };

    loadSaveSlots();
  }, [getSaveSlots]);

  const slotsPerPage = 10;
  const totalPages = Math.ceil(saveSlots.length / slotsPerPage) || 1;
  const currentSlots = saveSlots.slice(currentPage * slotsPerPage, (currentPage + 1) * slotsPerPage);

  // Fill remaining slots with empty ones for UI consistency
  const displaySlots = [...currentSlots, ...Array(slotsPerPage - currentSlots.length).fill(null)];

  const handleSlotAction = async (slotIndex: number) => {
    const globalSlotIndex = currentPage * slotsPerPage + slotIndex;
    const slot = currentSlots[slotIndex];

    try {
      if (type === 'save') {
        let slotId: string;

        if (slot && slot.id === 'auto-save') {
          // Save to auto-save
          slotId = 'auto-save';
          await saveToSlot(slotId);
          notificationRef.current?.show('快速存档保存成功');
        } else {
          // Save to regular slot - calculate slot ID based on position
          // Skip auto-save slot if it exists in the list
          const autoSaveExists = saveSlots.length > 0 && saveSlots[0].id === 'auto-save';
          const adjustedIndex = autoSaveExists ? globalSlotIndex : globalSlotIndex + 1;
          slotId = String(adjustedIndex);
          await saveToSlot(slotId);
          notificationRef.current?.show(`保存到存档槽 ${slotId} 成功`);
        }

        // Reload save slots to update UI
        const updatedSlots = await getSaveSlots();
        setSaveSlots(updatedSlots);
      } else if (type === 'load' && slot) {
        // Load from slot (handles both auto-save and regular slots)
        const success = await loadFromSlot(slot.id);
        if (success) {
          const slotName = slot.id === 'auto-save' ? '快速存档' : `存档槽 ${slot.id}`;
          notificationRef.current?.show(`读取${slotName}成功`);
          handleExit();
        } else {
          const slotName = slot.id === 'auto-save' ? '快速存档' : `存档槽 ${slot.id}`;
          notificationRef.current?.show(`读取${slotName}失败`);
        }
      }
    } catch (error) {
      console.error(`${type} operation failed:`, error);
      notificationRef.current?.show(`${type === 'save' ? '保存' : '读取'}失败`);
    }
  };

  const handleDeleteSlot = async (slotIndex: number) => {
    const slot = currentSlots[slotIndex];
    if (!slot) return;

    try {
      await deleteSaveSlot(slot.id);
      notificationRef.current?.show(`删除存档槽 ${slot.id} 成功`);

      // Reload save slots to update UI
      const updatedSlots = await getSaveSlots();
      setSaveSlots(updatedSlots);
    } catch (error) {
      console.error('Delete slot failed:', error);
      notificationRef.current?.show(`删除存档槽 ${slot.id} 失败`);
    }
  };

  const handleExit = () => {
    backButtonSound();
    setTimeout(() => {
      context.setOverlayPage(null);
    }, 100);
  };

  return (
    <container>
      <sprite label="透明遮罩" src="ui/mask-transparent.png" onClick={handleExit} />
      <sprite label="背景图" src="ui/sl_bg.png" pivot={[0.5, 0.5]} x={960} y={540}>
        <text label="标题" text={type?.toUpperCase()} fontSize={48} fillColor="white" x={64} y={54} />
        <Button
          fileNames={['ui/sl_close.png', 'ui/sl_close_hover.png', 'ui/sl_close_press.png']}
          x={1532}
          y={62}
          onClick={handleExit}
        />
        <container x={606} y={60}>
          {[...Array(Math.min(5, totalPages))].map((_, index) => (
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
          {displaySlots.map((slot, index) => {
            const hasData = slot !== null;
            const isInteractive = hasData || type === 'save';
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
              <container key={`${slot}`} x={positionData[0]} y={positionData[1]}>
                <Button
                  fileNames={['ui/sl_item.png', 'ui/sl_item_hover.png', 'ui/sl_item_press.png']}
                  onMouseEnter={hoverButtonSound}
                  interactive={isInteractive}
                  onClick={() => isInteractive && handleSlotAction(index)}
                />
                {!hasData && (
                  <container interactive={false}>
                    <text
                      text={type === 'save' ? '点击保存' : 'NO DATA'}
                      fontSize={32}
                      lineHeight={1.5}
                      fillColor={TEXT_COLOR.DEFAULT_IDLE}
                      pivot={[0.5, 0.5]}
                      x={712 / 2}
                      y={130 / 2}
                    />
                  </container>
                )}
                {hasData && slot && (
                  <container interactive={false}>
                    <sprite src="non-free/snapshot.png" x={2} y={2} />
                    <text
                      text={slot.metadata?.scenarioName || `存档 ${slot.id}`}
                      fontSize={28}
                      lineHeight={1.2}
                      fillColor={TEXT_COLOR.DEFAULT_IDLE}
                      x={250}
                      y={7}
                    />
                    <text
                      text={slot.metadata?.currentLine || ''}
                      fontSize={20}
                      lineHeight={1.3}
                      boxWidth={442}
                      boxHeight={52}
                      fillColor={TEXT_COLOR.DEFAULT_IDLE}
                      x={250}
                      y={50}
                    />
                    <text
                      text={new Date(slot.timestamp)
                        .toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                        .replace(/\//g, '\\/')}
                      fontSize={16}
                      lineHeight={1.2}
                      fillColor={TEXT_COLOR.DEFAULT_IDLE}
                      pivot={[1, 0]}
                      x={689}
                      y={104}
                    />
                    {type === 'load' && (
                      <Button
                        fileNames={['ui/sl_close.png', 'ui/sl_close_hover.png', 'ui/sl_close_press.png']}
                        x={660}
                        y={5}
                        scale={0.5}
                        onClick={() => handleDeleteSlot(index)}
                      />
                    )}
                  </container>
                )}
              </container>
            );
          })}
        </container>
      </sprite>

      <Notification ref={notificationRef} />
    </container>
  );
}
