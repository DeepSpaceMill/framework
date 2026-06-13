import { getNavigator, getSeekingType, TextLine, type CommandHandler, type TextLineHandler } from '@momoyu-ink/kit';
import {
  gameState,
  resetGameState,
  type BuiltinTransitionEffect,
  type SceneTransitionEffect,
  type TextBoxAvatarConfig,
} from '../state/game';
import { GamePage } from '../state/ui';
import { writeCurrentGameStateToScenario } from '../utils/scenarioGameState';
import { ScenarioCommandSchemaType } from './commands';
import { resolveCameraTarget } from '../lib/camera';
import { getSoundAudioChannel, getVoiceAudioChannel } from '../lib/audioChannels';

function recordBacklog(control: { record(meta: Record<string, any>): string }, meta: Record<string, any>) {
  if (getSeekingType() === 'warp') {
    return;
  }

  writeCurrentGameStateToScenario();
  control.record(meta);
}

function parseTextLeading(leading: string | null | undefined) {
  const parts = leading?.split('|').map((part) => part.trim()) ?? [];

  return {
    speaker: parts[0] ?? '',
    voice: parts[1] ?? '',
    avatarName: parts[2] ?? '',
  };
}

function applyAvatarPatch(
  target: TextBoxAvatarConfig,
  patch: {
    src?: string;
    enable?: boolean;
    offsetX?: number;
    offsetY?: number;
    spacing?: number;
  },
) {
  if (patch.src !== undefined) {
    target.src = patch.src;
    if (patch.enable === undefined) {
      target.enable = true;
    }
  }

  if (patch.enable !== undefined) target.enable = patch.enable;
  if (patch.offsetX !== undefined) target.offsetX = patch.offsetX;
  if (patch.offsetY !== undefined) target.offsetY = patch.offsetY;
  if (patch.spacing !== undefined) target.spacing = patch.spacing;
}

function toBuiltinTransitionEffect(
  cmd: Extract<ScenarioCommandSchemaType, { effect: string }>,
): BuiltinTransitionEffect {
  const { command: _, effect, fadeTime: __, skippable: ___, noWait: ____, ...otherArgs } = cmd as typeof cmd & {
    fadeTime?: number;
    skippable?: boolean;
    noWait?: boolean;
  };

  return { type: 'builtin', name: effect, ...otherArgs } as BuiltinTransitionEffect;
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
  gameState.textbox.avatarName = '';
  gameState.character.currentSpeaker = undefined;
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
  gameState.textbox.hideReason = undefined;
  gameState.textbox.visible = true;
  // auto-advance
};

/** Hide text box. */
export const handleTextBoxHide: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'textBoxHide') return;
  gameState.textbox.hideReason = 'command';
  gameState.textbox.visible = false;
  // auto-advance
};

/** Configure direct textbox avatar settings. */
export const handleAvatar: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'avatar') return;

  applyAvatarPatch(gameState.textbox.avatar, cmd);
  // auto-advance
};

/** Configure textbox avatar settings for a specific character and optional avatar name. */
export const handleAvatarFor: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'avatarFor') return;

  const targetName = cmd.name?.trim();
  const entryIndex = gameState.textbox.avatarFor.findIndex(
    (entry) => entry.character === cmd.character && entry.name === targetName,
  );
  const nextEntry =
    entryIndex === -1
      ? {
          src: '',
          enable: true,
          offsetX: 0,
          offsetY: 0,
          spacing: 0,
          character: cmd.character,
          name: targetName,
        }
      : {
          ...gameState.textbox.avatarFor[entryIndex],
          character: cmd.character,
          name: targetName,
        };

  applyAvatarPatch(nextEntry, cmd);

  if (entryIndex !== -1) {
    gameState.textbox.avatarFor.splice(entryIndex, 1, nextEntry);
  } else {
    gameState.textbox.avatarFor.push(nextEntry);
  }
  // auto-advance
};

// ---------------------------------------------------------------------------
// Sound command handlers
// ---------------------------------------------------------------------------

/** Play background music. */
export const handleBgm: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'bgm') return;
  gameState.bgm.loop = cmd.loop;
  gameState.bgm.volume = cmd.volume;
  gameState.bgm.fadeTime = cmd.fadeTime;
  gameState.bgm.waitForEnd = cmd.waitForEnd;
  gameState.bgm.src = cmd.src;
  if (cmd.waitForEnd) {
    control.hold();
  } else if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Stop background music. */
export const handleBgmStop: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'bgmStop') return;
  gameState.bgm.fadeTime = cmd.fadeTime;
  gameState.bgm.src = '';
  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Play a sound effect. */
export const handleSfx: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'sfx') return;
  gameState.sfx.src = cmd.src;
  gameState.sfx.loop = cmd.loop;
  gameState.sfx.volume = cmd.volume;
  gameState.sfx.fadeTime = cmd.fadeTime;
  gameState.sfx.waitForEnd = cmd.waitForEnd;
  gameState.sfx.seq++;
  if (cmd.waitForEnd) {
    control.hold();
  } else if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Stop all sound effects. */
export const handleSfxStop: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'sfxStop') return;
  gameState.sfx.stopFadeTime = cmd.fadeTime;
  gameState.sfx.stopSeq++;
  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Play a voice clip. */
export const handleVoice: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'voice') return;
  gameState.voice.src = cmd.src;
  gameState.voice.channel = getVoiceAudioChannel(cmd.name);
  gameState.voice.volume = cmd.volume;
  gameState.voice.waitForEnd = cmd.waitForEnd;
  if (cmd.waitForEnd) {
    control.hold();
  }
  // auto-advance (non-waitForEnd) — VoiceActor handles audio lifecycle and auto ticket
};

/** Stop voice playback. */
export const handleVoiceStop: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'voiceStop') return;
  // Clearing src signals VoiceActor to cancel any pending ticket and release audio
  gameState.voice.src = '';
  // auto-advance
};

/** Play sound on a named channel. */
export const handleSound: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'sound') return;
  gameState.sound.channel = getSoundAudioChannel(cmd.channel);
  gameState.sound.src = cmd.src;
  gameState.sound.loop = cmd.loop;
  gameState.sound.volume = cmd.volume;
  gameState.sound.fadeTime = cmd.fadeTime;
  gameState.sound.waitForEnd = cmd.waitForEnd;
  gameState.sound.seq++;
  if (cmd.waitForEnd) {
    control.hold();
  } else if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Stop sound on a named channel. */
export const handleSoundStop: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'soundStop') return;
  gameState.sound.stopChannel = getSoundAudioChannel(cmd.channel);
  gameState.sound.stopFadeTime = cmd.fadeTime;
  gameState.sound.stopSeq++;
  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

// ---------------------------------------------------------------------------
// Video command handlers
// ---------------------------------------------------------------------------

/**
 * Play a fullscreen video. Holds the scenario; VideoActor advances via
 * nextLine() once the video ends naturally or is confirmed to be skipped.
 */
export const handleVideo: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'video') return;

  if (getSeekingType() === 'warp') {
    gameState.video.visible = false;
    gameState.video.src = '';
    return;
  }

  gameState.video.src = cmd.src;
  gameState.video.fadeTime = cmd.fadeTime;
  gameState.video.skippable = cmd.skippable;
  gameState.video.visible = true;
  // Block scenario advancement; auto/skip blockers in VideoActor will stop
  // those modes via this hold(). VideoActor calls nextLine() when done.
  control.hold();
};

// ---------------------------------------------------------------------------
// Background command handlers
// ---------------------------------------------------------------------------

/** Change background image with optional fade. */
export const handleBg: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'bg') return;
  gameState.background.src = cmd.src;
  gameState.background.fadeTime = cmd.fadeTime;
  gameState.background.skippable = cmd.skippable;
  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Set background tint color. */
export const handleBgTint: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'bgTint') return;
  gameState.background.fadeTime = cmd.fadeTime;
  gameState.background.skippable = cmd.skippable;
  if (cmd.tint === 'off' || cmd.tint === 'none') {
    gameState.background.tint = undefined;
  } else {
    gameState.background.tint = cmd.tint;
  }
  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Move the stage camera with parallax and background blur. */
export const handleCamera: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'camera') return;

  const target = resolveCameraTarget({
    preset: cmd.preset,
    x: cmd.x,
    y: cmd.y,
    zoom: cmd.zoom,
    depth: cmd.depth,
    blur: cmd.blur,
    fadeTime: cmd.fadeTime,
  });

  gameState.camera.x = target.x;
  gameState.camera.y = target.y;
  gameState.camera.zoom = target.zoom;
  gameState.camera.depth = target.depth;
  gameState.camera.blur = target.blur;
  gameState.camera.fadeTime = target.fadeTime;

  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Prepare a full-scene transition without starting playback yet. */
export const handleTransPrepare: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'transPrepare') return;

  if (gameState.sceneTransition.phase !== 'stable') {
    console.warn('transPrepare: called while another transition is still active');
    return;
  }

  gameState.sceneTransition.key += 1;
  gameState.sceneTransition.phase = 'prepared';
  gameState.sceneTransition.retain = cmd.retain;
  // auto-advance
};

/** Start the prepared full-scene transition. */
export const handleTransPerform: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'transPerform') return;

  if (gameState.sceneTransition.phase !== 'prepared') {
    console.warn('transPerform: called without a pending transPrepare');
    return;
  }

  gameState.sceneTransition.performKey += 1;
  gameState.sceneTransition.phase = 'performing';
  const { fadeTime, skippable, noWait } = cmd;
  gameState.sceneTransition.effect = toBuiltinTransitionEffect(cmd) as SceneTransitionEffect;
  gameState.sceneTransition.fadeTime = fadeTime;
  gameState.sceneTransition.skippable = skippable;

  if (!noWait) {
    control.setWaiting(fadeTime, skippable);
  }
};

/** Set the transition effect used by background changes. */
export const handleBgTransEffect: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'bgTransEffect') return;

  gameState.background.transitionEffect = toBuiltinTransitionEffect(cmd);
  // auto-advance
};

/** Set the transition effect used by character changes. */
export const handleCharTransEffect: CommandHandler<ScenarioCommandSchemaType> = (cmd, _control) => {
  if (cmd.command !== 'charTransEffect') return;

  gameState.character.transitionEffect = toBuiltinTransitionEffect(cmd);
  // auto-advance
};

// ---------------------------------------------------------------------------
// Character command handlers
// ---------------------------------------------------------------------------

/** Add a character on stage. */
export const handleCharEnter: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'charEnter') return;
  const existingIndex = gameState.character.characters.findIndex((c) => c.name === cmd.name);
  // Look up preset values
  const presetData = cmd.preset ? gameState.character.presets[cmd.preset] : undefined;
  if (cmd.preset && !presetData) {
    console.warn(`Unknown character preset: ${cmd.preset}`);
  }
  const targetVisible = cmd.visible ?? presetData?.visible ?? true;

  if (existingIndex !== -1) {
    const char = gameState.character.characters[existingIndex];
    const wasVisible = char.visible && char.presence !== 'leaving';

    char.src = cmd.src;
    char.x = cmd.x ?? presetData?.x ?? char.x;
    char.y = cmd.y ?? presetData?.y ?? char.y;
    char.scale = cmd.scale ?? presetData?.scale ?? char.scale;
    char.tint = cmd.tint ?? presetData?.tint ?? char.tint;
    char.pivot = cmd.pivot ?? presetData?.pivot ?? char.pivot;
    char.fadeTime = cmd.fadeTime;
    if (targetVisible) {
      if (wasVisible) {
        char.visible = true;
        char.presence = 'present';
      } else {
        char.visible = false;
        char.presence = 'entering';
      }
    } else {
      char.visible = false;
      char.presence = 'present';
    }
  } else {
    gameState.character.characters.push({
      name: cmd.name,
      src: cmd.src,
      presence: targetVisible ? 'entering' : 'present',
      x: cmd.x ?? presetData?.x ?? 0,
      y: cmd.y ?? presetData?.y ?? 0,
      scale: cmd.scale ?? presetData?.scale ?? 1,
      tint: cmd.tint ?? presetData?.tint ?? '#fff',
      pivot: cmd.pivot ?? presetData?.pivot ?? [0.5, 1],
      fadeTime: cmd.fadeTime,
      visible: false,
    });
  }
  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
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
  const targetVisible = cmd.visible ?? presetData?.visible ?? char.visible;

  char.src = cmd.src ?? char.src;
  char.x = cmd.x ?? presetData?.x ?? char.x;
  char.y = cmd.y ?? presetData?.y ?? char.y;
  char.scale = cmd.scale ?? presetData?.scale ?? char.scale;
  char.tint = cmd.tint ?? presetData?.tint ?? char.tint;
  char.pivot = cmd.pivot ?? presetData?.pivot ?? char.pivot;
  char.fadeTime = cmd.fadeTime;
  if (targetVisible) {
    char.visible = true;
    char.presence = 'present';
  } else {
    char.visible = false;
    char.presence = 'present';
  }

  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Remove a character from stage. */
export const handleCharLeave: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'charLeave') return;
  const index = gameState.character.characters.findIndex((c) => c.name === cmd.name);
  if (index === -1) return;
  const character = gameState.character.characters[index];

  character.fadeTime = cmd.fadeTime;
  character.visible = false;
  character.presence = 'leaving';
  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
};

/** Remove all characters from stage. */
export const handleCharClear: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'charClear') return;
  gameState.character.characters.forEach((char) => {
    char.fadeTime = cmd.fadeTime;
    char.visible = false;
    char.presence = 'leaving';
  });
  if (!cmd.noWait) {
    control.setWaiting(cmd.fadeTime, cmd.skippable);
  }
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

  if (getSeekingType() === 'warp') {
    return;
  }

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

  if (getSeekingType() === 'warp') {
    gameState.selection.visible = false;
    gameState.selection.options.length = 0;
    gameState.selection.saveTo = undefined;
    return;
  }

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
  const { speaker, voice, avatarName } = parseTextLeading(e.leading);

  if (voice) {
    handleVoice(
      {
        command: 'voice',
        src: `voice/${voice}.opus`,
        name: speaker,
        volume: 1,
        waitForEnd: false,
      },
      control,
    );
  }

  gameState.character.currentSpeaker = speaker || undefined;
  gameState.textbox.name = speaker;
  gameState.textbox.avatarName = avatarName;

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
    speaker,
    voice,
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
