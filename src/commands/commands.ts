import z from 'zod';

const ChangeBgCommandSchema = z
  .object({
    command: z.literal('changebg'),
    src: z.string().describe('image source'),
    fadeTime: z.number().optional().describe('Fade time in milliseconds, default is 1000'),
    skippable: z.boolean().optional().describe('Whether the background change can be skipped, default is false'),
  })
  .describe('Change background command');

const CharAddCommandSchema = z.object({
  command: z.literal('addchar'),
  name: z.string(),
  src: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  visible: z.boolean().optional(),
  scale: z.number().optional(),
  tint: z.string().optional(),
  pivot: z.tuple([z.number(), z.number()]).optional(),
  fadeTime: z.number().optional(),
});

const CharChangeCommandSchema = z.object({
  command: z.literal('charchange'),
  name: z.string(),
  src: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  visible: z.boolean().optional(),
  scale: z.number().optional(),
  tint: z.string().optional(),
  pivot: z.tuple([z.number(), z.number()]).optional(),
  fadeTime: z.number().optional(),
});

const CharRemoveCommandSchema = z.object({
  command: z.literal('charremove'),
  name: z.string(),
  fadeTime: z.number().optional(),
});

const CharClearCommandSchema = z.object({
  command: z.literal('charclear'),
  fadeTime: z.number().optional(),
});

const CharNameCommandSchema = z.object({
  command: z.literal('charname'),
  name: z.string(),
  to: z.string(),
});

const WaitCommandSchema = z.object({
  command: z.literal('wait'),
  skippable: z.boolean().optional(),
  time: z.number(),
});

const SoundCommandSchema = z.object({
  command: z.literal('sound'),
  channel: z.string(),
  src: z.string(),
  loop: z.boolean().optional(),
  volume: z.number().optional(),
  fadeTime: z.number().optional(),
});

const SoundStopCommandSchema = z.object({
  command: z.literal('soundStop'),
  channel: z.string(),
  fadeTime: z.number().optional(),
});

const WaitClickCommandSchema = z.object({
  command: z.literal('waitclick'),
});

const LeaveStageCommandSchema = z.object({
  command: z.literal('leaveStage'),
  // GamePage
  gotoPage: z.string(),
});

const SetTitleCommandSchema = z.object({
  command: z.literal('setTitle'),
  text: z.string(),
});

const SetProgressCommandSchema = z.object({
  command: z.literal('setProgress'),
  game: z.enum(['nar', 'nar2']),
  chapter: z.number().optional(),
  epilogue: z.boolean().optional(),
  nar1Limited: z.boolean().optional(),
});

const SetTextBoxPosCommandSchema = z.object({
  command: z.literal('setTextBoxPos'),
  x: z.number(),
  y: z.number(),
});

const SetBgTintCommandSchema = z.object({
  command: z.literal('setBgTint'),
  tint: z.string(),
});

export const ScenarioCommandSchema = z.discriminatedUnion('command', [
  ChangeBgCommandSchema,
  CharAddCommandSchema,
  CharChangeCommandSchema,
  CharRemoveCommandSchema,
  CharClearCommandSchema,
  CharNameCommandSchema,
  WaitCommandSchema,
  SoundCommandSchema,
  SoundStopCommandSchema,
  WaitClickCommandSchema,
  LeaveStageCommandSchema,
  SetTitleCommandSchema,
  SetProgressCommandSchema,
  SetTextBoxPosCommandSchema,
  SetBgTintCommandSchema,
]);

export type ScenarioCommandSchemaType = z.infer<typeof ScenarioCommandSchema>;

// export json schema via console log
// const schema = ScenarioCommandSchema.toJSONSchema();
// console.log(JSON.stringify(schema, null, 2));
