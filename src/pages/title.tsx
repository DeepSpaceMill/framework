import { useEffect, useRef, useState } from 'react';
import {
  MouseEvent,
  animated,
  ensureArchiveVariableDefaults,
  executePluginCommand,
  useNavigation,
  useSoundEffect,
  useSpringRef,
  useTransition,
  useUiData,
} from '@momoyu-ink/kit';
import { Button } from '../components/button';
import type { TitleButtonAction } from '../data/ui';
import { uiActions } from '../state/ui';
import { resetScenarioSessionForNewGame } from '../utils/scenarioGameState';

export function Title() {
  const titleUi = useUiData('title');
  const navigation = useNavigation();

  const hoverButtonSound = useSoundEffect(titleUi.buttonHoverSound);
  const clickButtonSound = useSoundEffect(titleUi.buttonClickSound);

  // `visible` drives the enter/leave transition. A pending action is captured
  // before flipping `visible` to false so we can navigate once the leave
  // animation finishes.
  const [visible, setVisible] = useState(true);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const transRef = useSpringRef();

  // Declarative enter/leave transition. Unrelated re-renders (UI data hot
  // reload, notifications, etc.) won't restart or freeze the animation
  // because the transition's internal state is keyed by `visible` only.
  const transitions = useTransition(visible, {
    ref: transRef,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: titleUi.fadeTime },
    onRest: (_result, _ctrl, item) => {
      if (item === false) {
        const action = pendingActionRef.current;
        pendingActionRef.current = null;
        action?.();
      }
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-trigger on visible change
  useEffect(() => {
    transRef.start();
  }, [transRef, visible]);

  // Snap the in-flight animation to its final state. Used when the user
  // clicks the background to skip the fade.
  const skipFade = () => {
    transRef.set({ opacity: visible ? 1 : 0 });
  };

  const handleButtonClick = (action: TitleButtonAction) => (e: MouseEvent) => {
    if (action.type === 'gotoPage') {
      clickButtonSound();
      pendingActionRef.current = () => {
        if (action.name === 'stage') {
          void resetScenarioSessionForNewGame()
            .then(() =>
              ensureArchiveVariableDefaults().catch((error) => {
                console.warn('Failed to apply archive variable defaults before starting a new game:', error);
              }),
            )
            .then(() => {
              navigation.navigate('stage', { story: 'start', entry: 'entry', isNewGame: true });
            })
            .catch((error) => {
              console.error('Failed to prepare runtime state before starting a new game:', error);
            });
          return;
        }
        navigation.navigate(action.name as never);
      };
      setVisible(false);
      e.stopPropagation();
      return;
    }

    if (action.type === 'pushOverlay') {
      clickButtonSound();
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

  return (
    <container label="title">
      {transitions(
        (style, item) =>
          item && (
            <animated.container
              {...style}
              label="content"
              onClick={(e) => {
                if (e.targetId === e.currentTargetId) {
                  skipFade();
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
                  x={button.position.x}
                  y={button.position.y}
                  pivot={[0.5, 0.5]}
                  anchor={[0.5, 0.5]}
                  onClick={handleButtonClick(button.action)}
                  onMouseEnter={hoverButtonSound}
                />
              ))}
            </animated.container>
          ),
      )}
    </container>
  );
}
