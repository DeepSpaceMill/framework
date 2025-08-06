import { addEventListener, KeyboardEvent } from '@momoyu-ink/kit';
import { useEffect, useMemo, useRef } from 'react';
import { useScenario } from '../hooks/useScenario';
import { Notification } from '../components/notification';
import { type NotificationHandle } from '../hooks/useNotification';
import {
  BackgroundActor,
  useBackground,
  CharacterActor,
  useCharacters,
  TextBoxActor,
  useTextBox,
  type TextBoxHandle,
  TextBoxButton,
  useStageManager,
} from '../actors';

export function Stage() {
  const notificationRef = useRef<NotificationHandle>(null);
  const textBoxRef = useRef<TextBoxHandle>(null);

  const stories = useMemo(() => ['example'], []);
  const nextLine = useScenario(stories, 'example');

  // Initialize actors
  const { backgroundState } = useBackground();
  const { characterState, setSpeaker } = useCharacters();
  const { textBoxState, progress, hideTextBox, showTextBox } = useTextBox();
  const { stageState, handleAdvance, handleToggleTextBox } =
    useStageManager(nextLine);

  const handleClick = () => {
    const shouldShowTextBox = handleAdvance(
      textBoxState.visible,
      progress.current,
      () => textBoxRef.current?.finishPrinting()
    );

    if (shouldShowTextBox) {
      showTextBox();
    }
  };

  const handleButtonClick = (button: TextBoxButton) => {
    console.log(`TextBox button clicked: ${button}`);
    switch (button) {
      case TextBoxButton.SAVE:
        notificationRef.current?.show('已保存成功');
        break;
      case TextBoxButton.LOAD:
        notificationRef.current?.show('读档功能待实现');
        break;
      case TextBoxButton.AUTO:
        notificationRef.current?.show('自动模式切换');
        break;
      case TextBoxButton.SKIP:
        notificationRef.current?.show('跳过模式切换');
        break;
      case TextBoxButton.HIST:
        notificationRef.current?.show('历史记录功能待实现');
        break;
      case TextBoxButton.CONF:
        notificationRef.current?.show('设置功能待实现');
        break;
      default:
        console.warn(`Unknown button: ${button}`);
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
  }, [
    textBoxState.visible,
    handleClick,
    handleToggleTextBox,
    showTextBox,
    hideTextBox,
  ]);

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

      <Notification ref={notificationRef} />
    </container>
  );
}
