import { useEffect } from 'react';
import {
  MouseEvent,
  useFadeIn,
  useSoundEffect,
  useNavigation,
  useUiData,
  animated,
  executePluginCommand,
} from '@momoyu-ink/kit';
import { Button } from '../components/button';
import type { TitleButtonAction } from '../data/ui';
import { uiActions } from '../state/ui';

export function Title() {
  const titleUi = useUiData('title');
  const [contentStyle, contentApi, contentSkip] = useFadeIn(titleUi.fadeTime, true);
  const navigation = useNavigation();

  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.opus');
  const clickButtonSound = useSoundEffect('audio/confirm_style_5_echo_001.opus');

  const handleButtonClick = (action: TitleButtonAction) => (e: MouseEvent) => {
    if (action.type === 'gotoPage') {
      clickButtonSound();
      contentApi.start({
        to: { opacity: 0 },
        delay: 0,
        pause: false,
        onRest: () => {
          if (action.name === 'stage') {
            navigation.navigate('stage', { story: 'start', entry: 'entry', isNewGame: true });
            return;
          }

          navigation.navigate(action.name as never);
        },
      });
      e.stopPropagation();
      return;
    }

    if (action.type === 'pushOverlay') {
      if (action.name === 'saveload') {
        navigation.pushOverlay('saveload', { type: 'load' });
      } else {
        navigation.pushOverlay('settings');
      }
      e.stopPropagation();
      return;
    }

    clickButtonSound();
    uiActions.confirm('确定要退出游戏吗？', () => {
      executePluginCommand('system', {
        subCommand: 'quit',
      });
    });
    e.stopPropagation();
  };

  useEffect(() => {
    contentApi.start({ pause: false });
  }, [contentApi]);

  return (
    <container label="title">
      <animated.container
        {...contentStyle}
        label="content"
        onClick={(e) => {
          if (e.targetId === e.currentTargetId) {
            contentSkip();
          }
        }}
      >
        <sprite src={titleUi.background} />

        {titleUi.buttons.map((button, index) => (
          <Button
            key={`${button.text}-${index}`}
            fileNames={button.fileNames}
            text={button.text}
            fontSize={button.fontSize}
            color={button.color}
            x={button.x}
            y={button.y}
            pivot={[0.5, 0.5]}
            anchor={[0.5, 0.5]}
            onClick={handleButtonClick(button.action)}
            onMouseEnter={hoverButtonSound}
          />
        ))}
      </animated.container>
    </container>
  );
}
