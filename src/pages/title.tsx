import { useEffect } from 'react';
import {
  Button,
  type PressEvent,
  useFadeIn,
  useSoundEffect,
  useNavigation,
  animated,
  executePluginCommand,
} from '@momoyu-ink/kit';
import { uiActions } from '../state/ui';

export function Title() {
  const [contentStyle, contentApi, contentSkip] = useFadeIn(500, true);
  const navigation = useNavigation();

  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.opus');
  const clickButtonSound = useSoundEffect('audio/confirm_style_5_echo_001.opus');

  const handleStart = (e: PressEvent) => {
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

  const handleExit = (e: PressEvent) => {
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

        <vbox gap={4} pivot={[0.5, 0.5]} x={960} y={805}>
          <Button
            sprite={{ src: ['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png'] }}
            text={'开始游戏'}
            textStyle={{ fontSize: 36, glyphGridSize: 36, fillColor: '#ffffff' }}
            onPress={handleStart}
            onMouseEnter={hoverButtonSound}
          />
          <Button
            sprite={{ src: ['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png'] }}
            text={'读取存档'}
            textStyle={{ fontSize: 36, glyphGridSize: 36, fillColor: '#ffffff' }}
            onPress={() => navigation.pushOverlay('saveload', { type: 'load' })}
            onMouseEnter={hoverButtonSound}
          />
          <Button
            sprite={{ src: ['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png'] }}
            text={'设置'}
            textStyle={{ fontSize: 36, glyphGridSize: 36, fillColor: '#ffffff' }}
            onPress={() => navigation.pushOverlay('settings')}
            onMouseEnter={hoverButtonSound}
          />
          <Button
            sprite={{ src: ['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png'] }}
            text={'退出'}
            textStyle={{ fontSize: 36, glyphGridSize: 36, fillColor: '#ffffff' }}
            onPress={handleExit}
            onMouseEnter={hoverButtonSound}
          />
        </vbox>
      </animated.container>
    </container>
  );
}
