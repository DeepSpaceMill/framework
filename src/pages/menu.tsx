import { useContext } from 'react';
import { animated, useTransition } from '@momoyu-ink/kit';
import { EntryContext } from '../router';
import { useSoundEffect } from '../hooks/useSoundEffect';
import { Button } from '../components/button';
import { executePluginCommand } from '@momoyu-ink/kit';

export function Menu() {
  const context = useContext(EntryContext);

  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.ogg');
  const backButtonSound = useSoundEffect('audio/back_style_5_001.ogg');
  const startButtonSound = useSoundEffect('audio/confirm_style_5_echo_001.ogg');

  const transitions = useTransition([0], {
    keys: (item) => item,
    from: {
      opacity: 0,
      scale: 0.3,
    },
    enter: {
      opacity: 1,
      scale: 1,
    },
    leave: {
      opacity: 0,
      scale: 0.8,
    },
    config: {
      mass: 0.5,
      tension: 280,
      friction: 12,
    },
  });

  const handleExit = () => {
    backButtonSound();
    setTimeout(() => {
      context.setOverlayPage(null);
    }, 100);
  };

  const handleToSettings = () => {
    startButtonSound();
    setTimeout(() => {
      context.setOverlayPage(null);
      context.setOverlayPage('settings');
    }, 100);
  };

  const handleToMainMenu = () => {
    startButtonSound();
    context.confirm('确定要返回主菜单吗？', () => {
      setTimeout(() => {
        context.setOverlayPage(null);
        context.setPage('title');
      }, 100);
    });
  };

  const handleToQuit = () => {
    startButtonSound();
    context.confirm('确定要退出游戏吗？', () => {
      setTimeout(() => {
        executePluginCommand('system', {
          subCommand: 'quit',
        });
      }, 300);
    });
  };

  return transitions((style, _) => (
    <container>
      <animated.sprite label="半透明遮罩" src="ui/mask.png" onClick={handleExit} opacity={style.opacity} />
      <animated.sprite label="背景图" src="ui/menu_bg.png" pivot={[0.5, 0.5]} x={960} y={540} {...style}>
        <Button
          fileNames={['ui/menu_style2.png', 'ui/menu_style2_hover.png', 'ui/menu_style2_press.png']}
          x={0}
          y={50}
          anchor={[0.5, 0]}
          text="继续游戏"
          color="#f0f0f0"
          onMouseEnter={hoverButtonSound}
          onClick={handleExit}
        />
        <Button
          fileNames={['ui/menu_style2.png', 'ui/menu_style2_hover.png', 'ui/menu_style2_press.png']}
          x={0}
          y={50 + 102}
          anchor={[0.5, 0]}
          text="设置"
          color="#f0f0f0"
          onMouseEnter={hoverButtonSound}
          onClick={handleToSettings}
        />
        <Button
          fileNames={['ui/menu_style2.png', 'ui/menu_style2_hover.png', 'ui/menu_style2_press.png']}
          x={0}
          y={50 + 102 * 2}
          anchor={[0.5, 0]}
          text="回到主界面"
          color="#f0f0f0"
          onMouseEnter={hoverButtonSound}
          onClick={handleToMainMenu}
        />
        <Button
          fileNames={['ui/menu_style1.png', 'ui/menu_style1_hover.png', 'ui/menu_style1_press.png']}
          x={0}
          y={50 + 102 * 3}
          anchor={[0.5, 0]}
          text="退出到桌面"
          color="#f0f0f0"
          onMouseEnter={hoverButtonSound}
          onClick={handleToQuit}
        />
      </animated.sprite>
    </container>
  ));
}
