import {
  useScenario,
  nextLine,
  useNavigation,
  useNavigationParams,
  addEventListener,
  KeyboardEvent,
  createStage,
  StageContextProvider,
  executePluginCommand,
  WheelEvent,
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
  handleBg,
  handleBgTint,
  handleCamera,
  handleCharEnter,
  handleCharAction,
  handleCharLeave,
  handleCharClear,
  handleCharName,
  handleWait,
  handleWaitClick,
  handleLeaveStage,
  handleTitle,
  handleTextLine,
  handleCharPreset,
  handleCharAutoTint,
  handleOptionAdd,
  handleOptionShow,
  handleOptionClear,
} from '../commands/handlers';
import { uiActions } from '../state/ui';
import { gameState } from '../state/game';
import { settingsState } from '../state/settings';
import { BackgroundActor } from '../actors/background';
import { CameraActor, BackgroundPlane, CharacterPlane } from '../actors/camera';
import { CharacterActor } from '../actors/character';
import { SelectionActor } from '../actors/selection';
import { TextBoxActor, TextBoxButton } from '../actors/textbox';
import { BGMActor } from '../actors/bgm';
import { VoiceActor } from '../actors/voice';
import { SfxActor } from '../actors/sfx';
import { SoundActor } from '../actors/sound';
import { ScenarioCommandSchema } from '../commands/commands';
import { useSaveLoad } from '../hooks/useSaveLoad';

type StageInstance = ReturnType<typeof createStage>;

type StageGlobal = typeof globalThis & {
  __MOYU_FRAMEWORK_STAGE__?: StageInstance;
};

function getStageSingleton(): StageInstance {
  const stageGlobal = globalThis as StageGlobal;
  if (stageGlobal.__MOYU_FRAMEWORK_STAGE__ === undefined) {
    // Keep the stage instance stable across Fast Refresh so runtime state can survive code updates.
    stageGlobal.__MOYU_FRAMEWORK_STAGE__ = createStage();
  }
  return stageGlobal.__MOYU_FRAMEWORK_STAGE__;
}

function registerStageHandlers(stage: StageInstance): Array<() => void> {
  return [
    stage.registerCommandSchema(ScenarioCommandSchema),
    stage.registerCommand('text', handleText),
    stage.registerCommand('textClear', handleTextClear),
    stage.registerCommand('textBox', handleTextBox),
    stage.registerCommand('textBoxShow', handleTextBoxShow),
    stage.registerCommand('textBoxHide', handleTextBoxHide),
    stage.registerCommand('bgm', handleBgm),
    stage.registerCommand('bgmStop', handleBgmStop),
    stage.registerCommand('sfx', handleSfx),
    stage.registerCommand('sfxStop', handleSfxStop),
    stage.registerCommand('voice', handleVoice),
    stage.registerCommand('voiceStop', handleVoiceStop),
    stage.registerCommand('sound', handleSound),
    stage.registerCommand('soundStop', handleSoundStop),
    stage.registerCommand('bg', handleBg),
    stage.registerCommand('bgTint', handleBgTint),
    stage.registerCommand('camera', handleCamera),
    stage.registerCommand('charEnter', handleCharEnter),
    stage.registerCommand('charAction', handleCharAction),
    stage.registerCommand('charLeave', handleCharLeave),
    stage.registerCommand('charClear', handleCharClear),
    stage.registerCommand('charName', handleCharName),
    stage.registerCommand('charPreset', handleCharPreset),
    stage.registerCommand('charAutoTint', handleCharAutoTint),
    stage.registerCommand('wait', handleWait),
    stage.registerCommand('waitClick', handleWaitClick),
    stage.registerCommand('leaveStage', handleLeaveStage),
    stage.registerCommand('title', handleTitle),
    stage.registerCommand('optionAdd', handleOptionAdd),
    stage.registerCommand('optionShow', handleOptionShow),
    stage.registerCommand('optionClear', handleOptionClear),
    stage.registerTextLine(handleTextLine),
  ];
}

const stage = getStageSingleton();

function stopVoiceOnPageAdvance() {
  if (!settingsState.skip_voice || !gameState.voice.src) {
    return;
  }

  void executePluginCommand('audio', {
    subCommand: 'release',
    name: gameState.voice.channelName,
    fadeTime: 0,
  });
}

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

  useEffect(() => {
    const unregisters = registerStageHandlers(stage);

    return () => {
      for (const unregister of unregisters) {
        unregister();
      }
    };
  }, []);

  const stories = useMemo(() => [story], [story]);
  useScenario(stories, story, entry, isNewGame);

  // Initialize save/load functionality
  const { saveToSlot, loadFromSlot, checkAutoSaveExists } = useSaveLoad();

  const handleClick = useCallback(() => {
    if (stage.isAutoing()) {
      stage.stopAuto();
    }

    if (navigation.getOverlayStack().length > 0) return;
    // Don't advance story while waiting for player to select a choice
    if (gameState.selection.visible) return;
    if (!gameState.textbox.visible) {
      gameState.textbox.visible = true;
      return;
    }
    // Try interrupt callbacks first; if none consumed, advance
    if (!stage.tryInterrupt()) {
      stopVoiceOnPageAdvance();
      void nextLine();
    }
  }, [navigation]);

  useEffect(() => {
    const stopSkipOnInput = () => {
      if (stage.isSkipping()) stage.stopSkip();
    };
    const c1 = addEventListener('mousedown', stopSkipOnInput);
    const c2 = addEventListener('touchstart', stopSkipOnInput);
    return () => {
      c1();
      c2();
    };
  }, []);

  const handleButtonClick = async (button: TextBoxButton) => {
    try {
      if (button !== TextBoxButton.AUTO && stage.isAutoing()) {
        stage.stopAuto();
      }

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
          if (stage.isSkipping()) {
            stage.stopSkip();
          }

          if (stage.isAutoing()) {
            stage.stopAuto();
          } else {
            stage.startAuto();
          }
          break;
        case TextBoxButton.SKIP:
          stage.startSkip();
          break;
        case TextBoxButton.LOG:
          navigation.pushOverlay('backlog');
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
        if (stage.isAutoing()) {
          stage.stopAuto();
        }

        stage.startSkip();
      } else if (e.key === 'Enter' || e.key === ' ') {
        handleClick();
      } else if (e.key === 'Escape') {
        gameState.textbox.visible = !gameState.textbox.visible;
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
      stage.stopAuto();
      stage.stopSkip();
    });
  }, []);

  // Clean up skip state on Stage unmount (singleton persists across navigations)
  useEffect(() => {
    return () => {
      stage.stopAuto();
      stage.stopSkip();
    };
  }, []);

  useEffect(() => {
    const c1 = addEventListener('click', handleClick);
    const c2 = addEventListener('touchend', handleClick);
    return () => {
      c1();
      c2();
    };
  }, [handleClick]);

  useEffect(() => {
    return addEventListener('wheel', (event: WheelEvent) => {
      if (event.deltaY <= 0) return;
      if (navigation.getCurrentPage() !== 'stage') return;
      if (navigation.getOverlayStack().length > 0) return;
      if (stage.isAutoing()) {
        stage.stopAuto();
      }
      navigation.pushOverlay('backlog');
    });
  }, [navigation]);

  return (
    <StageContextProvider stage={stage}>
      <CameraActor>
        <BackgroundPlane>
          <BackgroundActor />
        </BackgroundPlane>
        <CharacterPlane>
          <CharacterActor />
        </CharacterPlane>
      </CameraActor>
      <TextBoxActor onButtonClick={handleButtonClick} />
      <BGMActor />
      <VoiceActor />
      <SfxActor />
      <SoundActor />
      <SelectionActor />
    </StageContextProvider>
  );
}
