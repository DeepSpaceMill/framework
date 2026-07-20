import { useNavigation, animated, Button, useTransition, useSoundEffect } from '@momoyu-ink/kit';
import { uiActions } from '../state/ui';
import { executePluginCommand } from '@momoyu-ink/kit';
import { resetGameState } from '../state/game';

export function Menu() {
  const navigation = useNavigation();

  const hoverButtonSound = useSoundEffect('audio/cursor_style_4.opus');
  const backButtonSound = useSoundEffect('audio/back_style_5_001.opus');
  const startButtonSound = useSoundEffect('audio/confirm_style_5_echo_001.opus');

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
      navigation.popOverlay();
    }, 100);
  };

  const handleToSettings = () => {
    startButtonSound();
    setTimeout(() => {
      navigation.popOverlay();
      navigation.pushOverlay('settings');
    }, 100);
  };

  const handleToMainMenu = () => {
    startButtonSound();
    uiActions.confirm('确定要返回主菜单吗？', () => {
      resetGameState();
      navigation.clearOverlays();
      navigation.navigate('title');
    });
  };

  const handleToQuit = () => {
    startButtonSound();
    uiActions.confirmUnique('exit-game', '确定要退出游戏吗？', () => {
      executePluginCommand('system', {
        subCommand: 'quit',
      });
    });
  };

  return transitions((style, _) => (
    <animated.backdrop filters={[{ type: 'blur', radius: 4 }]} opacity={style.opacity}>
      <animated.sprite label="半透明遮罩" src="ui/mask.png" onClick={handleExit} />
      <animated.sprite label="背景图" src="ui/menu_bg.png" pivot={[0.5, 0.5]} x={960} y={540} {...style}>
        <vbox gap={35} anchor={[0.5, 0]} pivot={[0.5, 0]} y={50}>
          <Button
            sprite={{ src: ['ui/menu_style2.png', 'ui/menu_style2_hover.png', 'ui/menu_style2_press.png'] }}
            text="继续游戏"
            textStyle={{ fillColor: '#f0f0f0' }}
            onMouseEnter={hoverButtonSound}
            onPress={handleExit}
          />
          <Button
            sprite={{ src: ['ui/menu_style2.png', 'ui/menu_style2_hover.png', 'ui/menu_style2_press.png'] }}
            text="设置"
            textStyle={{ fillColor: '#f0f0f0' }}
            onMouseEnter={hoverButtonSound}
            onPress={handleToSettings}
          />
          <Button
            sprite={{ src: ['ui/menu_style2.png', 'ui/menu_style2_hover.png', 'ui/menu_style2_press.png'] }}
            text="回到主界面"
            textStyle={{ fillColor: '#f0f0f0' }}
            onMouseEnter={hoverButtonSound}
            onPress={handleToMainMenu}
          />
          <Button
            sprite={{ src: ['ui/menu_style1.png', 'ui/menu_style1_hover.png', 'ui/menu_style1_press.png'] }}
            text="退出到桌面"
            textStyle={{ fillColor: '#f0f0f0' }}
            onMouseEnter={hoverButtonSound}
            onPress={handleToQuit}
          />
        </vbox>
      </animated.sprite>
    </animated.backdrop>
  ));
}
