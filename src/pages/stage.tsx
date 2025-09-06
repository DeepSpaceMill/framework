import { addEventListener, KeyboardEvent } from '@momoyu-ink/kit';
import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import {
  BackgroundActor,
  CharacterActor,
  TextBoxActor,
  TextBoxButton,
  type TextBoxHandle,
  useBackground,
  useCharacters,
  useStageManager,
  useTextBox,
} from '../actors';
import { useSaveLoad } from '../hooks/useSaveLoad';
import { useScenario } from '../hooks/useScenario';
import { EntryContext } from '../router';

export function Stage() {
  const context = useContext(EntryContext);
  const textBoxRef = useRef<TextBoxHandle>(null);

  const stories = useMemo(() => ['example'], []);
  const nextLine = useScenario(stories, 'example');

  // Initialize save/load functionality
  const { saveToSlot, loadFromSlot, checkAutoSaveExists } = useSaveLoad();

  // Initialize actors
  const { backgroundState } = useBackground();
  const { characterState, setSpeaker } = useCharacters();
  const { textBoxState, progress, hideTextBox, showTextBox } = useTextBox();
  const { handleAdvance, handleToggleTextBox } = useStageManager(nextLine);

  const handleClick = useCallback(() => {
    const shouldShowTextBox = handleAdvance(textBoxState.visible, progress.current, () =>
      textBoxRef.current?.finishPrinting(),
    );

    if (shouldShowTextBox) {
      showTextBox();
    }
  }, [handleAdvance, textBoxState.visible, progress, showTextBox]);

  const handleButtonClick = async (button: TextBoxButton) => {
    try {
      switch (button) {
        case TextBoxButton.QSAVE:
          await saveToSlot('auto-save');
          context.notify('快速保存成功');
          break;
        case TextBoxButton.QLOAD: {
          // Check if auto-save exists in engine
          const autoSaveExists = await checkAutoSaveExists();
          if (autoSaveExists) {
            const success = await loadFromSlot('auto-save');
            if (success) {
              context.notify('快速读档成功');
            } else {
              context.notify('快速读档失败');
            }
          } else {
            context.notify('没有可读取的存档');
          }
          break;
        }
        case TextBoxButton.SAVE:
          context.setOverlayPage('save');
          break;
        case TextBoxButton.LOAD: {
          context.setOverlayPage('load');
          break;
        }
        case TextBoxButton.AUTO:
          context.notify('自动模式待实现');
          break;
        // case TextBoxButton.SKIP:
        //   context.notify('跳过模式切换');
        //   break;
        case TextBoxButton.HIST:
          context.notify('历史记录功能待实现');
          break;
        case TextBoxButton.MENU:
          context.setOverlayPage('menu');
          break;
        default:
          console.warn(`Unknown button: ${button}`);
      }
    } catch (error) {
      console.error('操作失败:', error);
      context.notify('遇到问题，这是一个 BUG');
    }
  };

  // Sync character speaker with textbox name
  useEffect(() => {
    if (textBoxState.name) {
      setSpeaker(textBoxState.name);
    }
  }, [textBoxState.name, setSpeaker]);

  useEffect(() => {
    return addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleClick();
      } else if (e.key === 'Escape') {
        const newVisible = handleToggleTextBox(textBoxState.visible);
        if (newVisible) {
          showTextBox();
        } else {
          hideTextBox();
        }
      }
    });
  }, [textBoxState.visible, handleClick, handleToggleTextBox, showTextBox, hideTextBox]);

  return (
    <container onClick={handleClick}>
      <BackgroundActor backgroundState={backgroundState} />

      <CharacterActor characterState={characterState} />

      <TextBoxActor
        ref={textBoxRef}
        textBoxState={textBoxState}
        progress={progress}
        onButtonClick={handleButtonClick}
        onHideTextBox={hideTextBox}
      />
    </container>
  );
}
