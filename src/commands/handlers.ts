import { getNavigator, TextLine, type CommandHandler, type TextLineHandler } from '@momoyu-ink/kit';
import { gameState, resetGameState } from '../state/game';
import { GamePage } from '../state/ui';
import { writeCurrentGameStateToScenario } from '../utils/scenarioGameState';
import { ScenarioCommandSchemaType } from './commands';
import { settingsState } from '../state/settings';

function recordBacklog(control: { record(meta: Record<string, any>): string }, meta: Record<string, any>) {
  writeCurrentGameStateToScenario();
  control.record(meta);
}

// ---------------------------------------------------------------------------
// Text command handlers
// ---------------------------------------------------------------------------

/** Display text via the text command. */
export const handleText: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'text') return;

  let tailing = '';

  if (!cmd.clear) {
    tailing += '+';
  }

  if (!cmd.newline) {
    tailing += '&';
  }

  if (cmd.autoAdvance) {
    tailing += '!';
  }

  const textLine: TextLine = {
    leading: cmd.name ?? null,
    text: cmd.content ?? null,
    tailing: tailing,
  };

  handleTextLine(textLine, control);
};

/** Clear text box content. */
export const handleTextClear: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'textClear') return;
  gameState.textbox.text = '';
  gameState.textbox.name = '';
  // auto-advance
};

/** Configure text box rendering properties. Only updates explicitly provided fields. */
export const handleTextBox: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'textBox') return;
  const tb = gameState.textbox;
  if (cmd.position !== undefined) {
    tb.x = cmd.position[0];
    tb.y = cmd.position[1];
  }
  if (cmd.printMode !== undefined) tb.printMode = cmd.printMode;
  if (cmd.printSpeed !== undefined) tb.printSpeed = cmd.printSpeed;
  if (cmd.fillColor !== undefined) tb.fillColor = cmd.fillColor;
  if (cmd.lineHeight !== undefined) tb.lineHeight = cmd.lineHeight;
  if (cmd.indent !== undefined) tb.indent = cmd.indent;
  if (cmd.stroke !== undefined) tb.stroke = cmd.stroke;
  if (cmd.shadow !== undefined) tb.shadow = cmd.shadow;
  if (cmd.strokeColor !== undefined) tb.strokeColor = cmd.strokeColor;
  if (cmd.strokeWidth !== undefined) tb.strokeWidth = cmd.strokeWidth;
  if (cmd.shadowColor !== undefined) tb.shadowColor = cmd.shadowColor;
  if (cmd.shadowOffsetX !== undefined) tb.shadowOffsetX = cmd.shadowOffsetX;
  if (cmd.shadowOffsetY !== undefined) tb.shadowOffsetY = cmd.shadowOffsetY;
  if (cmd.shadowBlur !== undefined) tb.shadowBlur = cmd.shadowBlur;
  if (cmd.shadowWidth !== undefined) tb.shadowWidth = cmd.shadowWidth;
  // auto-advance
};

/** Show text box. */
export const handleTextBoxShow: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'textBoxShow') return;
  gameState.textbox.visible = true;
  // auto-advance
};

/** Hide text box. */
export const handleTextBoxHide: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'textBoxHide') return;
  gameState.textbox.visible = false;
  // auto-advance
};

// ---------------------------------------------------------------------------
// Sound command handlers
// ---------------------------------------------------------------------------

/** Play background music. */
export const handleBgm: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'bgm') return;
  gameState.bgm.loop = cmd.loop;
  gameState.bgm.volume = (cmd.volume ?? 1.0) * settingsState.volume_bgm;
  gameState.bgm.fadeTime = cmd.fadeTime;
  gameState.bgm.src = cmd.src;
  // auto-advance
};

/** Stop background music. */
export const handleBgmStop: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'bgmStop') return;
  gameState.bgm.fadeTime = cmd.fadeTime;
  gameState.bgm.src = '';
  // auto-advance
};

/** Play a sound effect. */
export const handleSfx: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'sfx') return;
  gameState.sfx.src = cmd.src;
  gameState.sfx.loop = cmd.loop;
  gameState.sfx.volume = (cmd.volume ?? 1.0) * settingsState.volume_se;
  gameState.sfx.fadeTime = cmd.fadeTime;
  gameState.sfx.seq++;
  // auto-advance — SfxActor handles audio lifecycle and skip check
};

/** Stop all sound effects. */
export const handleSfxStop: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'sfxStop') return;
  gameState.sfx.stopFadeTime = cmd.fadeTime;
  gameState.sfx.stopSeq++;
  // auto-advance — SfxActor handles audio release
};

/** Play a voice clip. */
export const handleVoice: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'voice') return;
  gameState.voice.src = cmd.src;
  gameState.voice.channelName = cmd.name ? `voice_${cmd.name}` : 'voice';
  gameState.voice.volume = (cmd.volume ?? 1.0) * settingsState.volume_voice;
  // auto-advance — VoiceActor handles audio lifecycle and auto ticket
};

/** Stop voice playback. */
export const handleVoiceStop: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'voiceStop') return;
  // Clearing src signals VoiceActor to cancel any pending ticket and release audio
  gameState.voice.src = '';
  // auto-advance
};

/** Play sound on a named channel. */
export const handleSound: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'sound') return;
  gameState.sound.channel = cmd.channel;
  gameState.sound.src = cmd.src;
  gameState.sound.loop = cmd.loop;
  gameState.sound.volume = (cmd.volume ?? 1.0) * settingsState.volume_se;
  gameState.sound.fadeTime = cmd.fadeTime;
  gameState.sound.seq++;
  // auto-advance — SoundActor handles audio lifecycle and skip check
};

/** Stop sound on a named channel. */
export const handleSoundStop: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'soundStop') return;
  gameState.sound.stopChannel = cmd.channel;
  gameState.sound.stopFadeTime = cmd.fadeTime;
  gameState.sound.stopSeq++;
  // auto-advance — SoundActor handles audio release
};

// ---------------------------------------------------------------------------
// Background command handlers
// ---------------------------------------------------------------------------

/** Change background image with optional fade. */
export const handleBg: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'bg') return;
  gameState.background.src = cmd.src;
  gameState.background.fadeTime = cmd.fadeTime ?? 1000;
  gameState.background.skippable = cmd.skippable ?? false;
  control.setWaiting(gameState.background.fadeTime, gameState.background.skippable);
};

/** Set background tint color. */
export const handleBgTint: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'bgTint') return;
  gameState.background.fadeTime = cmd.fadeTime ?? 1000;
  gameState.background.skippable = cmd.skippable ?? false;
  if (cmd.tint === 'off' || cmd.tint === 'none') {
    gameState.background.tint = undefined;
  } else {
    gameState.background.tint = cmd.tint;
  }
  control.setWaiting(gameState.background.fadeTime, gameState.background.skippable);
};

// ---------------------------------------------------------------------------
// Character command handlers
// ---------------------------------------------------------------------------

/** Add a character on stage. */
export const handleCharEnter: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'charEnter') return;
  const existingIndex = gameState.character.characters.findIndex((c) => c.name === cmd.name);
  // Look up preset values
  const presetData = cmd.preset ? gameState.character.presets[cmd.preset] : undefined;
  if (cmd.preset && !presetData) {
    console.warn(`Unknown character preset: ${cmd.preset}`);
  }

  if (existingIndex !== -1) {
    const char = gameState.character.characters[existingIndex];

    char.src = cmd.src;
    char.x = cmd.x ?? presetData?.x ?? char.x;
    char.y = cmd.y ?? presetData?.y ?? char.y;
    char.scale = cmd.scale ?? presetData?.scale ?? char.scale;
    char.tint = cmd.tint ?? presetData?.tint ?? char.tint;
    char.pivot = cmd.pivot ?? presetData?.pivot ?? char.pivot;
    char.fadeTime = cmd.fadeTime ?? presetData?.fadeTime ?? 500;
    char.visible = cmd.visible ?? presetData?.visible ?? true;
  } else {
    gameState.character.characters.push({
      name: cmd.name,
      src: cmd.src,
      x: cmd.x ?? presetData?.x ?? 0,
      y: cmd.y ?? presetData?.y ?? 0,
      scale: cmd.scale ?? presetData?.scale ?? 1,
      tint: cmd.tint ?? presetData?.tint ?? '#fff',
      pivot: cmd.pivot ?? presetData?.pivot ?? [0.5, 1],
      fadeTime: cmd.fadeTime ?? presetData?.fadeTime ?? 500,
      visible: cmd.visible ?? presetData?.visible ?? true,
    });
  }
  // auto-advance
};

/** Change an existing character's properties. */
export const handleCharAction: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'charAction') return;
  const char = gameState.character.characters.find((c) => c.name === cmd.name);
  if (!char) {
    console.warn(`charAction: character "${cmd.name}" not found`);
    return;
  }

  // Look up preset values
  const presetData = cmd.preset ? gameState.character.presets[cmd.preset] : undefined;
  if (cmd.preset && !presetData) {
    console.warn(`Unknown character preset: ${cmd.preset}`);
  }

  char.src = cmd.src ?? char.src;
  char.x = cmd.x ?? presetData?.x ?? char.x;
  char.y = cmd.y ?? presetData?.y ?? char.y;
  char.scale = cmd.scale ?? presetData?.scale ?? char.scale;
  char.tint = cmd.tint ?? presetData?.tint ?? char.tint;
  char.pivot = cmd.pivot ?? presetData?.pivot ?? char.pivot;
  char.fadeTime = cmd.fadeTime ?? presetData?.fadeTime ?? char.fadeTime;
  char.visible = cmd.visible ?? presetData?.visible ?? char.visible;

  control.setWaiting(char.fadeTime, false);
  // auto-advance
};

/** Remove a character from stage. */
export const handleCharLeave: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'charLeave') return;
  const index = gameState.character.characters.findIndex((c) => c.name === cmd.name);
  const character = gameState.character.characters[index];

  character.fadeTime = cmd.fadeTime ?? character.fadeTime;

  if (index !== -1) {
    gameState.character.characters.splice(index, 1);
    control.setWaiting(character.fadeTime, false);
  }
  // auto-advance
};

/** Remove all characters from stage. */
export const handleCharClear: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'charClear') return;
  gameState.character.characters.forEach((char) => {
    char.fadeTime = cmd.fadeTime ?? char.fadeTime;
  });
  gameState.character.characters.length = 0;
  control.setWaiting(cmd.fadeTime ?? 0, false);
  // auto-advance
};

/** Map a character internal name to a display name (stub — full refactor deferred). */
export const handleCharName: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'charName') return;
  // TODO: implement character display name mapping after char system refactor
  console.warn(`charName: "${cmd.name}" -> "${cmd.to}" (not yet implemented)`);
  // auto-advance
};

export const handleCharPreset: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'charPreset') return;
  const preset = gameState.character.presets[cmd.preset] ?? {};
  if (cmd.x !== undefined) preset.x = cmd.x;
  if (cmd.y !== undefined) preset.y = cmd.y;
  if (cmd.scale !== undefined) preset.scale = cmd.scale;
  if (cmd.tint !== undefined) preset.tint = cmd.tint;
  if (cmd.visible !== undefined) preset.visible = cmd.visible;
  if (cmd.pivot !== undefined) preset.pivot = cmd.pivot;
  if (cmd.fadeTime !== undefined) preset.fadeTime = cmd.fadeTime;
  gameState.character.presets[cmd.preset] = preset;
  // auto-advance
};

export const handleCharAutoTint: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'charAutoTint') return;

  gameState.character.autoTintEnabled = cmd.enabled ?? gameState.character.autoTintEnabled;
  gameState.character.autoTint = cmd.tint ?? gameState.character.autoTint;
  // auto-advance
};

// ---------------------------------------------------------------------------
// Flow control command handlers
// ---------------------------------------------------------------------------

/** Timed wait. */
export const handleWait: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'wait') return;
  control.setWaiting(cmd.time, cmd.skippable || false);
};

/** Wait for user click. */
export const handleWaitClick: CommandHandler<ScenarioCommandSchemaType> = (_cmd, control) => {
  control.hold();
};

// ---------------------------------------------------------------------------
// Misc command handlers
// ---------------------------------------------------------------------------

/** Leave the stage — navigate away. */
export const handleLeaveStage: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'leaveStage') return;
  getNavigator().navigate(cmd.gotoPage as GamePage);
  resetGameState();
  control.unskippable(); // Must be before hold() — prevents skip from advancing after navigation
  control.hold(); // Navigation away — do not advance
};

/** Set story title metadata. */
export const handleTitle: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'title') return;
  gameState.story.title = cmd.text;
  // auto-advance
};

// ---------------------------------------------------------------------------
// Selection command handlers
// ---------------------------------------------------------------------------

/** Add a selection option to the pending list. */
export const handleOptionAdd: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'optionAdd') return;
  gameState.selection.options.push({ text: cmd.text, value: cmd.value });
  // auto-advance
};

/** Show all pending selection options and wait for the player to choose. */
export const handleOptionShow: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'optionShow') return;
  gameState.selection.saveTo = cmd.saveTo;
  // uncomment this if you want the textbox to hide during selection
  // gameState.textbox.visible = false;
  gameState.selection.visible = true;
  recordBacklog(control, {
    kind: 'selection',
    options: gameState.selection.options.map((option) => option.text),
  });
  control.unskippable(); // Must be before hold() — prevents skip from bypassing the selection
  control.hold();
};

/** Clear all pending selection options without showing them. */
export const handleOptionClear: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'optionClear') return;
  gameState.selection.options.length = 0;
  gameState.selection.saveTo = undefined;
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

  recordBacklog(control, {
    kind: 'text',
    speaker: e.leading || '',
    text: e.text || '',
  });

  if (e.tailing?.includes('!')) {
    // Tailing `!` means auto-advance immediately
    control.nextLine();
  } else {
    // Normal line: hold for user click
    control.hold();
  }
};
