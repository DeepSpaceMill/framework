import {
  useScenario,
  nextLine,
  useNavigation,
  useNavigationParams,
  addEventListener,
  KeyboardEvent,
  MouseEvent,
  createStage,
  StageContextProvider,
  executePluginCommand,
} from '@momoyu-ink/kit';
import { useCallback, useEffect, useMemo } from 'react';
import {
  handleText,
  handleTextClear,
  handleTextBox,
  handleTextBoxShow,
  handleTextBoxHide,
  handleBgm,
  handleBgmStop,
  handleSfx,
  handleSfxStop,
  handleVoice,
  handleVoiceStop,
  handleSound,
  handleSoundStop,
  handleChangeBg,
  handleSetBgTint,
  handleAddChar,
  handleCharChange,
  handleCharRemove,
  handleCharClear,
  handleCharName,
  handleWait,
  handleWaitClick,
  handleLeaveStage,
  handleSetTitle,
  handleTextLine,
  handleCharPreset,
} from '../commands/handlers';
import { uiActions } from '../state/ui';
import { gameState } from '../state/game';
import { BackgroundActor } from '../actors/background';
import { CharacterActor } from '../actors/character';
import { TextBoxActor, TextBoxButton } from '../actors/textbox';
import { BGMActor } from '../actors/bgm';
import { ScenarioCommandSchema } from '../commands/commands';
import { useSaveLoad } from '../hooks/useSaveLoad';

// Create the stage instance (module-level singleton)
const stage = createStage();

// Define the params interface for Stage page
interface StageParams {
  story: string;
  entry: string;
  isNewGame: boolean;
}

export function Stage() {
  const params = useNavigationParams<StageParams>();
  const navigation = useNavigation();

  const story = params?.story ?? '';
  const entry = params?.entry ?? '';
  const isNewGame = params?.isNewGame ?? true;

  const stories = useMemo(() => [story], [story]);
  useScenario(stories, story, entry, isNewGame);

  // Register all command and text line handlers
  useEffect(() => {
    const unregFns = [
      stage.registerCommandSchema(ScenarioCommandSchema),
      // Text commands
      stage.registerCommand('text', handleText),
      stage.registerCommand('textClear', handleTextClear),
      stage.registerCommand('textBox', handleTextBox),
      stage.registerCommand('textBoxShow', handleTextBoxShow),
      stage.registerCommand('textBoxHide', handleTextBoxHide),
      // Sound commands
      stage.registerCommand('bgm', handleBgm),
      stage.registerCommand('bgmStop', handleBgmStop),
      stage.registerCommand('sfx', handleSfx),
      stage.registerCommand('sfxStop', handleSfxStop),
      stage.registerCommand('voice', handleVoice),
      stage.registerCommand('voiceStop', handleVoiceStop),
      stage.registerCommand('sound', handleSound),
      stage.registerCommand('soundStop', handleSoundStop),
      // Background commands
      stage.registerCommand('changebg', handleChangeBg),
      stage.registerCommand('setBgTint', handleSetBgTint),
      // Character commands
      stage.registerCommand('addchar', handleAddChar),
      stage.registerCommand('charchange', handleCharChange),
      stage.registerCommand('charremove', handleCharRemove),
      stage.registerCommand('charclear', handleCharClear),
      stage.registerCommand('charname', handleCharName),
      stage.registerCommand('charpreset', handleCharPreset),
      // Flow control
      stage.registerCommand('wait', handleWait),
      stage.registerCommand('waitclick', handleWaitClick),
      // Misc
      stage.registerCommand('leaveStage', handleLeaveStage),
      stage.registerCommand('setTitle', handleSetTitle),
      // Text line handler
      stage.registerTextLine(handleTextLine),
    ];
    return () => unregFns.forEach((fn) => fn());
  }, []);

  // Initialize save/load functionality
  const { saveToSlot, loadFromSlot, checkAutoSaveExists } = useSaveLoad();

  const handleClick = useCallback(() => {
    if (!gameState.textbox.visible) {
      gameState.textbox.visible = true;
      return;
    }
    // Try interrupt callbacks first; if none consumed, advance
    if (!stage.tryInterrupt()) {
      void nextLine();
    }
  }, []);

  useEffect(() => {
    return addEventListener('mousedown', (_: MouseEvent) => {
      if (stage.isSkipping()) {
        stage.stopSkip();
      }
    });
  }, []);

  useEffect(() => {
    return addEventListener('touchstart', (_: TouchEvent) => {
      if (stage.isSkipping()) {
        stage.stopSkip();
      }
    });
  }, []);

  const handleButtonClick = async (button: TextBoxButton) => {
    try {
      switch (button) {
        case TextBoxButton.QSAVE:
          await executePluginCommand('system', {
            subCommand: 'takeSnapshot',
            width: 226,
            height: 127,
          });
          await saveToSlot('auto-save');
          uiActions.notify('快速保存成功');
          break;
        case TextBoxButton.QLOAD: {
          // Check if auto-save exists in engine
          const autoSaveExists = await checkAutoSaveExists();
          if (autoSaveExists) {
            const success = await loadFromSlot('auto-save');
            if (success) {
              uiActions.notify('快速读档成功');
            } else {
              uiActions.notify('快速读档失败');
            }
          } else {
            uiActions.notify('没有可读取的存档');
          }
          break;
        }
        case TextBoxButton.SAVE:
          await executePluginCommand('system', {
            subCommand: 'takeSnapshot',
            width: 226,
            height: 127,
          });
          navigation.pushOverlay('saveload', { type: 'save' });
          break;
        case TextBoxButton.LOAD: {
          navigation.pushOverlay('saveload', { type: 'load' });
          break;
        }
        case TextBoxButton.AUTO:
          uiActions.notify('自动模式待实现');
          break;
        // case TextBoxButton.SKIP:
        //   uiActions.notify('跳过模式切换');
        //   break;
        case TextBoxButton.HIST:
          uiActions.notify('历史记录功能待实现');
          break;
        case TextBoxButton.MENU:
          navigation.pushOverlay('menu');
          break;
        default:
          console.warn(`Unknown button: ${button}`);
      }
    } catch (error) {
      console.error('操作失败:', error);
      uiActions.notify('遇到问题，这是一个 BUG');
    }
  };

  useEffect(() => {
    return addEventListener('keydown', (e: KeyboardEvent) => {
      if (stage.isSkipping() && !e.repeat && e.key !== 'Control') {
        stage.stopSkip();
      } else if (e.key === 'Control' && !e.repeat) {
        stage.startSkip();
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleClick();
      } else if (e.key === 'Escape') {
        const newVisible = !gameState.textbox.visible;
        if (newVisible) {
          gameState.textbox.visible = true;
        } else {
          gameState.textbox.visible = false;
        }
      }
    });
  }, [handleClick]);

  // Stop skip on Ctrl release
  useEffect(() => {
    return addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        stage.stopSkip();
      }
    });
  }, []);

  // Stop skip on window blur (e.g. Alt+Tab)
  useEffect(() => {
    return addEventListener('blur', () => {
      stage.stopSkip();
    });
  }, []);

  // Clean up skip state on Stage unmount (singleton persists across navigations)
  useEffect(() => {
    return () => {
      stage.stopSkip();
    };
  }, []);

  // 监听左键点击
  useEffect(() => {
    return addEventListener('click', () => {
      handleClick();
    });
  }, [handleClick]);

  useEffect(() => {
    return addEventListener('touchend', () => {
      handleClick();
    });
  }, [handleClick]);

  return (
    <StageContextProvider stage={stage}>
      <BackgroundActor />
      <CharacterActor />
      <TextBoxActor onButtonClick={handleButtonClick} />
      <BGMActor />
    </StageContextProvider>
  );
}
