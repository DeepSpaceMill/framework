import z from 'zod';

/* Text Commands */

const TextCommandSchema = z
  .object({
    command: z.literal('text'),
    content: z.string(),
    name: z.string().optional(),
    newline: z.boolean().optional().default(true).describe('Start a new line before printing the text'),
    clear: z.boolean().optional().default(true).describe('Clear existing text before printing the text'),
    skippable: z.boolean().optional().default(true).describe('Whether the text can be skipped.'),
  })
  .describe('Display text');

const TextClearCommandSchema = z
  .object({
    command: z.literal('textClear'),
  })
  .describe('Clear text box');

const TextBoxCommandSchema = z
  .object({
    command: z.literal('textBox'),
    position: z.array(z.number()).length(2).optional().describe('x, y coordinates of the text box'),
    printMode: z
      .enum(['instant', 'typewriter', 'printer'])
      .optional()

      .describe('Text printing mode'),
    printSpeed: z
      .number()
      .optional()
      .describe('Speed of text printing, characters per second for typewriter, lines per second for printer'),
    fillColor: z.string().optional().describe('Text color'),
    lineHeight: z.number().optional().describe('Line height multiplier'),
    indent: z.number().optional().describe('Indentation in pixels for the first line of each paragraph'),
    stroke: z.boolean().optional().describe('Whether to apply stroke to text'),
    shadow: z.boolean().optional().describe('Whether to apply shadow to text'),
    strokeColor: z.string().optional().describe('Stroke color'),
    strokeWidth: z.number().optional().describe('Stroke width in pixels'),
    shadowColor: z.string().optional().describe('Shadow color'),
    shadowOffsetX: z.number().optional().describe('Shadow offset X in pixels'),
    shadowOffsetY: z.number().optional().describe('Shadow offset Y in pixels'),
    shadowBlur: z.number().optional().describe('Shadow blur radius in pixels'),
    shadowWidth: z.number().optional().describe('Shadow width in pixels, only effective when shadow is true'),
  })
  .describe('Configure text box');

const TextBoxShowCommandSchema = z
  .object({
    command: z.literal('textBoxShow'),
  })
  .describe('Show text box');

const TextBoxHideCommandSchema = z
  .object({
    command: z.literal('textBoxHide'),
  })
  .describe('Hide text box');

/* Sound Commands */

const BGMCommandSchema = z.object({
  command: z.literal('bgm'),
  src: z.string().describe('Asset path'),
  loop: z.boolean().optional().default(true).describe('Whether to loop the music, default is true'),
  volume: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(1)
    .describe('Volume of the music, ranges from 0 to 1, default is 1'),
  fadeTime: z.number().optional().default(600).describe('Fade time in milliseconds when starting the music'),
});

const BGMStopCommandSchema = z.object({
  command: z.literal('bgmStop'),
  fadeTime: z.number().optional().default(600).describe('Fade time in milliseconds when stopping the music'),
});

const SFXCommandSchema = z.object({
  command: z.literal('sfx'),
  src: z.string().describe('Asset path'),
  loop: z.boolean().optional().default(false).describe('Whether to loop the sound, default is false'),
  volume: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(1)
    .describe('Volume of the sound, ranges from 0 to 1, default is 1'),
  fadeTime: z.number().optional().default(600).describe('Fade time in milliseconds when playing the sound'),
});

const SFXStopCommandSchema = z.object({
  command: z.literal('sfxStop'),
  fadeTime: z.number().optional().default(600).describe('Fade time in milliseconds when stopping the sound'),
});

const VoiceCommandSchema = z.object({
  command: z.literal('voice'),
  src: z.string().describe('Asset path'),
  name: z.string().optional(),
  volume: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(1)
    .describe('Volume of the voice, ranges from 0 to 1, default is 1'),
});

const VoiceStopCommandSchema = z.object({
  command: z.literal('voiceStop'),
  name: z.string().optional(),
});

const SoundCommandSchema = z.object({
  command: z.literal('sound'),
  channel: z.string(),
  src: z.string().describe('Asset path'),
  loop: z.boolean().optional().default(false).describe('Whether to loop the sound, default is false'),
  volume: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(1)
    .describe('Volume of the sound, ranges from 0 to 1, default is 1'),
  fadeTime: z.number().optional().default(600).describe('Fade time in milliseconds when playing the sound'),
});

const SoundStopCommandSchema = z.object({
  command: z.literal('soundStop'),
  channel: z.string(),
  fadeTime: z.number().optional().default(600).describe('Fade time in milliseconds when stopping the sound'),
});

/* Background Commands */

const ChangeBgCommandSchema = z
  .object({
    command: z.literal('changebg'),
    src: z.string().describe('Asset path').describe('image source'),
    fadeTime: z.number().optional().default(1000).describe('Fade time in milliseconds, default is 1000'),
    skippable: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether the background change can be skipped, default is false'),
  })
  .describe('Change background command');

const SetBgTintCommandSchema = z
  .object({
    command: z.literal('setBgTint'),
    tint: z.string(),
  })
  .describe('Set background tint');

/* Character Commands */

const CharAddCommandSchema = z
  .object({
    command: z.literal('addchar'),
    name: z.string().optional(),
    src: z.string().describe('Asset path'),
    preset: z
      .enum(['left', 'center', 'right'])
      .optional()
      .describe('Position preset for the character, can be left, center, or right'),
    x: z.number().optional(),
    y: z.number().optional(),
    visible: z.boolean().optional(),
    scale: z.number().optional(),
    tint: z.string().optional(),
    pivot: z.tuple([z.number(), z.number()]).optional(),
    fadeTime: z.number().optional(),
  })
  .describe('Add a character to the stage');

const CharChangeCommandSchema = z
  .object({
    command: z.literal('charchange'),
    name: z.string().optional(),
    src: z.string().describe('Asset path').optional(),
    preset: z
      .enum(['left', 'center', 'right'])
      .optional()
      .describe('Position preset for the character, can be left, center, or right'),
    x: z.number().optional(),
    y: z.number().optional(),
    visible: z.boolean().optional(),
    scale: z.number().optional(),
    tint: z.string().optional(),
    pivot: z.tuple([z.number(), z.number()]).optional(),
    fadeTime: z.number().optional(),
  })
  .describe('Change a character on the stage');

const CharRemoveCommandSchema = z
  .object({
    command: z.literal('charremove'),
    name: z.string().optional(),
    fadeTime: z.number().optional(),
  })
  .describe('Remove a character from the stage');

const CharClearCommandSchema = z
  .object({
    command: z.literal('charclear'),
    fadeTime: z.number().optional(),
  })
  .describe('Clear all characters from the stage');

const CharNameCommandSchema = z
  .object({
    command: z.literal('charname'),
    name: z.string().optional(),
    to: z.string(),
  })
  .describe("Change a character's name");

const CharPresetCommandSchema = z
  .object({
    command: z.literal('charpreset'),
    preset: z.string(),
    x: z.number(),
    y: z.number(),
  })
  .describe('Define or modify a character position preset');

/* Flow Control Commands */

const WaitCommandSchema = z.object({
  command: z.literal('wait'),
  skippable: z.boolean().optional(),
  time: z.number(),
});

const WaitClickCommandSchema = z.object({
  command: z.literal('waitclick'),
});

/* Misc Commands */

const LeaveStageCommandSchema = z.object({
  command: z.literal('leaveStage'),
  // GamePage
  gotoPage: z.string(),
});

const SetTitleCommandSchema = z.object({
  command: z.literal('setTitle'),
  text: z.string(),
});

export const ScenarioCommandSchema = z.discriminatedUnion('command', [
  TextCommandSchema,
  TextClearCommandSchema,
  TextBoxCommandSchema,
  TextBoxShowCommandSchema,
  TextBoxHideCommandSchema,
  BGMCommandSchema,
  BGMStopCommandSchema,
  SFXCommandSchema,
  SFXStopCommandSchema,
  VoiceCommandSchema,
  VoiceStopCommandSchema,
  SoundCommandSchema,
  SoundStopCommandSchema,
  ChangeBgCommandSchema,
  SetBgTintCommandSchema,
  CharAddCommandSchema,
  CharChangeCommandSchema,
  CharRemoveCommandSchema,
  CharClearCommandSchema,
  CharNameCommandSchema,
  CharPresetCommandSchema,
  WaitCommandSchema,
  WaitClickCommandSchema,
  LeaveStageCommandSchema,
  SetTitleCommandSchema,
]);

export type ScenarioCommandSchemaType = z.infer<typeof ScenarioCommandSchema>;
