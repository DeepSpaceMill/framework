import type { MouseEvent } from '@momoyu-ink/kit';
import { animated } from '@momoyu-ink/kit';
import { executePluginCommand } from '@momoyu-ink/kit/dist/moyu';
import { useContext, useEffect } from 'react';
import { Button } from '../components/button';
import { TEXT_COLOR } from '../constants';
import { EntryContext } from '../router';
import { useFadeIn } from '../hooks/useFadeInOut';
import { useSoundEffect } from '../hooks/useSoundEffect';

export function Title() {
  const [contentStyle, contentApi, contentSkip] = useFadeIn(500, true);

  const context = useContext(EntryContext);

  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.ogg');
  const startButtonSound = useSoundEffect('audio/confirm_style_5_echo_001.ogg');

  const handleStart = (e: MouseEvent) => {
    startButtonSound();
    contentApi.start({
      to: { opacity: 0 },
      delay: 0,
      onRest: () => {
        context?.setPage('stage');
      },
    });
    e.stopPropagation();
  };

  const handleExit = () => {
    context.confirm('确定要退出游戏吗？', () => {
      setTimeout(() => {
        executePluginCommand('system', {
          subCommand: 'quit',
        });
      }, 300);
    });
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
        <sprite src="non-free/L3-夜晚开灯.png" />

        <Button
          fileNames={['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png']}
          text={'开始游戏'}
          fontSize={36}
          color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
          x={960}
          y={670}
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
          onClick={handleStart}
          onMouseEnter={hoverButtonSound}
        />
        <Button
          fileNames={['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png']}
          text={'读取存档'}
          fontSize={36}
          color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
          x={960}
          y={760}
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
          onClick={() => context.setOverlayPage('load')}
          onMouseEnter={hoverButtonSound}
        />
        <Button
          fileNames={['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png']}
          text={'设置'}
          fontSize={36}
          color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
          x={960}
          y={850}
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
          onClick={() => context.setOverlayPage('settings')}
          onMouseEnter={hoverButtonSound}
        />

        <Button
          fileNames={['ui/mainmenu_button.png', 'ui/mainmenu_button_hover.png', 'ui/mainmenu_button_press.png']}
          text={'退出'}
          fontSize={36}
          color={[TEXT_COLOR.DEFAULT_IDLE, TEXT_COLOR.DEFAULT_HOVER, TEXT_COLOR.DEFAULT_PRESS]}
          x={960}
          y={940}
          pivot={[0.5, 0.5]}
          anchor={[0.5, 0.5]}
          onClick={handleExit}
          onMouseEnter={hoverButtonSound}
        />
      </animated.container>
    </container>
  );
}
