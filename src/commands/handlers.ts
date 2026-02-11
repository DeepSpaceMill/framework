import {
  getNavigator,
  executePluginCommand,
  skipState,
  type CommandHandler,
  type TextLineHandler,
} from '@momoyu-ink/kit';
import { gameState, resetGameState } from '../state/game';
import { settingsState } from '../state/settings';
import { uiActions, GamePage } from '../state/ui';
import { ScenarioCommandSchemaType } from './commands';

// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------

/** Change background image with optional fade. */
export const handleChangeBg: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'changebg') return;
  gameState.background.src = cmd.src;
  gameState.background.fadeTime = cmd.fadeTime || 1000;
  gameState.background.skippable = cmd.skippable || false;
  control.setWaiting(gameState.background.fadeTime, gameState.background.skippable);
};

/** Set background tint color. */
export const handleSetBgTint: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'setBgTint') return;
  if (cmd.tint === 'off' || cmd.tint === 'none') {
    gameState.background.tint = undefined;
  } else {
    gameState.background.tint = cmd.tint;
  }
  // auto-advance (no control call)
};

/** Add or update a character on stage. */
export const handleAddChar: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'addchar') return;
  const existingIndex = gameState.character.characters.findIndex((c) => c.name === cmd.name);
  if (existingIndex !== -1) {
    const char = gameState.character.characters[existingIndex];
    char.src = cmd.src;
    char.x = cmd.x ?? char.x;
    char.y = cmd.y ?? char.y;
    char.scale = cmd.scale ?? char.scale;
    char.tint = cmd.tint ?? char.tint;
    char.pivot = cmd.pivot ?? char.pivot;
    char.fadeTime = cmd.fadeTime ?? 500;
    char.visible = cmd.visible ?? true;
  } else {
    gameState.character.characters.push({
      name: cmd.name,
      src: cmd.src,
      x: cmd.x ?? 0,
      y: cmd.y ?? 0,
      scale: cmd.scale ?? 1,
      tint: cmd.tint ?? '#fff',
      pivot: cmd.pivot ?? [0.5, 0.5],
      fadeTime: cmd.fadeTime ?? 500,
      visible: cmd.visible ?? true,
    });
  }
  // auto-advance
};

/** Set text box position. */
export const handleSetTextBoxPos: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'setTextBoxPos') return;
  gameState.textbox.x = cmd.x;
  gameState.textbox.y = cmd.y;
  // auto-advance
};

/** Play audio on a channel. */
export const handleSound: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'sound') return;

  // Skip SE during fast-forward to avoid audio overlap
  if (skipState.active && cmd.channel !== 'bgm') return;

  const defaultVolume = settingsState.volume_se;

  // BGM playback is handled via valtio subscribe on gameState.bgm
  if (cmd.channel !== 'bgm') {
    try {
      executePluginCommand('audio', {
        subCommand: 'load',
        name: cmd.channel,
        src: cmd.src,
        settings: {
          autoPlay: true,
          loopRegion: cmd.loop ? [0, -1] : undefined,
          volume: cmd.volume ?? defaultVolume,
          fadeTime: cmd.fadeTime ?? 0,
        },
      });
    } catch (err) {
      console.error(`Failed to play sound on channel ${cmd.channel}:`, err);
    }
  } else {
    gameState.bgm.loop = cmd.loop ?? true;
    gameState.bgm.volume = cmd.volume ?? settingsState.volume_bgm;
    gameState.bgm.fadeTime = cmd.fadeTime ?? 0;
    gameState.bgm.src = cmd.src;
  }
  // auto-advance
};

/** Stop audio on a channel. */
export const handleSoundStop: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'soundStop') return;
  if (cmd.channel !== 'bgm') {
    try {
      executePluginCommand('audio', {
        subCommand: 'release',
        name: cmd.channel,
      });
    } catch (err) {
      console.error(`Failed to stop sound on channel ${cmd.channel}:`, err);
    }
  } else {
    gameState.bgm.src = '';
  }
  // auto-advance
};

/** Timed wait. */
export const handleWait: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'wait') return;
  control.setWaiting(cmd.time, cmd.skippable || false);
};

/** Wait for user click. */
export const handleWaitClick: CommandHandler<ScenarioCommandSchemaType> = (_cmd, control) => {
  control.hold();
};

/** Leave the stage — navigate away. */
export const handleLeaveStage: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'leaveStage') return;
  if (cmd.gotoPage === 'title_nar1_limited') {
    uiActions.notify('narcissu 1 限定界面尚未实现');
  } else {
    getNavigator().navigate(cmd.gotoPage as GamePage);
  }
  resetGameState();
  control.unskippable(); // Must be before hold() — prevents skip from advancing after navigation
  control.hold(); // Navigation away — do not advance
};

/** Set story title metadata. */
export const handleSetTitle: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'setTitle') return;
  gameState.story.title = cmd.text;
  // auto-advance
};

// ---------------------------------------------------------------------------
// Text line handler
// ---------------------------------------------------------------------------

/** Process a text line from the scenario engine. */
export const handleTextLine: TextLineHandler = (e, control) => {
  gameState.textbox.name = e.leading || '';

  if (gameState.textbox.shouldAddNewline) {
    gameState.textbox.text += '\n';
  }

  if (gameState.textbox.shouldClear) {
    gameState.textbox.text = '';
  }

  gameState.textbox.text += e.text ?? '';

  gameState.textbox.shouldClear = !e.tailing?.includes('+');
  gameState.textbox.shouldAddNewline = !e.tailing?.includes('&');

  if (e.tailing?.includes('!')) {
    // Tailing `!` means auto-advance immediately
    control.nextLine();
  } else {
    // Normal line: hold for user click
    control.hold();
  }
};
