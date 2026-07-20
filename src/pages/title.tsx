import { useEffect } from 'react';
import { MouseEvent, useFadeIn, useSoundEffect, useNavigation, animated, executePluginCommand } from '@momoyu-ink/kit';
import { Button } from '../components/button';
import { uiActions } from '../state/ui';

export function Title() {
  const [contentStyle, contentApi, contentSkip] = useFadeIn(500, true);
  const navigation = useNavigation();

  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.opus');
  const clickButtonSound = useSoundEffect('audio/confirm_style_5_echo_001.opus');

  const handleStart = (e: MouseEvent) => {
    clickButtonSound();
    contentApi.start({
      to: { opacity: 0 },
      delay: 0,
      pause: false,
      onRest: () => {
        navigation.navigate('stage', { story: 'start', entry: 'entry', isNewGame: true });
      },
    });
    e.stopPropagation();
  };

  const handleExit = (e: MouseEvent) => {
    clickButtonSound();
    uiActions.confirmUnique('exit-game', '确定要退出游戏吗？', () => {
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
        <sprite src="title.webp" />

        <Button
          fileNames={['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png']}
          text={'开始游戏'}
          fontSize={36}
          color="#ffffff"
          x={960}
          y={670}
          pivot={[0.5, 0.5]}
          onClick={handleStart}
          onMouseEnter={hoverButtonSound}
        />
        <Button
          fileNames={['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png']}
          text={'读取存档'}
          fontSize={36}
          color="#ffffff"
          x={960}
          y={760}
          pivot={[0.5, 0.5]}
          onClick={() => navigation.pushOverlay('saveload', { type: 'load' })}
          onMouseEnter={hoverButtonSound}
        />
        <Button
          fileNames={['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png']}
          text={'设置'}
          fontSize={36}
          color="#ffffff"
          x={960}
          y={850}
          pivot={[0.5, 0.5]}
          onClick={() => navigation.pushOverlay('settings')}
          onMouseEnter={hoverButtonSound}
        />

        <Button
          fileNames={['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png']}
          text={'退出'}
          fontSize={36}
          color="#ffffff"
          x={960}
          y={940}
          pivot={[0.5, 0.5]}
          onClick={handleExit}
          onMouseEnter={hoverButtonSound}
        />
      </animated.container>
    </container>
  );
}
