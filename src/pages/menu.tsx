import { useNavigation, animated, useTransition, useSoundEffect, useUiData } from '@momoyu-ink/kit';
import { uiActions } from '../state/ui';
import { Button } from '../components/button';
import { executePluginCommand } from '@momoyu-ink/kit';
import { resetGameState } from '../state/game';
import type { MenuButtonAction } from '../data/ui';

export function Menu() {
  const menuUi = useUiData('menu');
  const navigation = useNavigation();

  const hoverButtonSound = useSoundEffect(menuUi.buttonHoverSound);
  const backButtonSound = useSoundEffect(menuUi.backButtonSound);
  const startButtonSound = useSoundEffect(menuUi.startButtonSound);

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

  const handleButtonClick = (action: MenuButtonAction) => () => {
    switch (action.type) {
      case 'resume':
        handleExit();
        return;
      case 'settings':
        handleToSettings();
        return;
      case 'title':
        handleToMainMenu();
        return;
      case 'quit':
        handleToQuit();
        return;
    }
  };

  return transitions((style, _) => (
    <animated.backdrop filters={[{ type: 'blur', radius: 4 }]} opacity={style.opacity}>
      <animated.sprite label="半透明遮罩" src="ui/mask.png" onClick={handleExit} />
      <animated.sprite label="背景图" src={menuUi.background} pivot={[0.5, 0.5]} x={960} y={540} {...style}>
        {menuUi.buttons.map((button, index) => (
          <Button
            key={`${button.text}-${index}`}
            fileNames={button.fileNames}
            x={button.position.x}
            y={button.position.y}
            anchor={[0.5, 0]}
            text={button.text}
            color={button.color}
            onMouseEnter={hoverButtonSound}
            onClick={handleButtonClick(button.action)}
          />
        ))}
      </animated.sprite>
    </animated.backdrop>
  ));
}
