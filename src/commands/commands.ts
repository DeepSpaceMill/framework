import z from 'zod';
import { CAMERA_PRESET_NAMES } from '../lib/camera';

/* ------------------------------------------------------------------ */
/*  Shared Fields                                                      */
/* ------------------------------------------------------------------ */

const audioSrc = z
  .string()
  .describe('Audio asset path')
  .meta({
    title: 'Audio',
    format: 'asset',
    'x-asset-kind': 'audio',
    'x-i18n': { 'zh-CN': '音频' },
    'x-i18n-desc': { 'zh-CN': '音频资源路径' },
  });

const imageSrc = z
  .string()
  .describe('Image asset path')
  .meta({
    title: 'Image',
    format: 'asset',
    'x-asset-kind': 'image',
    'x-i18n': { 'zh-CN': '图片' },
    'x-i18n-desc': { 'zh-CN': '图片资源路径' },
  });

const videoSrc = z
  .string()
  .describe('Video asset path')
  .meta({
    title: 'Video',
    format: 'asset',
    'x-asset-kind': 'video',
    'x-i18n': { 'zh-CN': '视频' },
    'x-i18n-desc': { 'zh-CN': '视频资源路径' },
  });

const volume = z
  .number()
  .min(0)
  .max(1)
  .optional()
  .default(1)
  .describe('Volume, ranges from 0 to 1')
  .meta({
    title: 'Volume',
    'x-i18n': { 'zh-CN': '音量' },
    'x-i18n-desc': { 'zh-CN': '音量，范围 0 到 1' },
  });

const fadeTime = (defaultMs: number) =>
  z
    .number()
    .optional()
    .default(defaultMs)
    .describe('Fade time in milliseconds')
    .meta({
      title: 'Fade Time',
      'x-i18n': { 'zh-CN': '渐变时间' },
      'x-i18n-desc': { 'zh-CN': '渐变时间（毫秒）' },
    });

const fadeTimeOpt = z
  .number()
  .optional()
  .describe('Fade time in milliseconds')
  .meta({
    title: 'Fade Time',
    'x-i18n': { 'zh-CN': '渐变时间' },
    'x-i18n-desc': { 'zh-CN': '渐变时间（毫秒）' },
  });

const loop = (defaultValue: boolean) =>
  z
    .boolean()
    .optional()
    .default(defaultValue)
    .describe('Whether to loop')
    .meta({
      title: 'Loop',
      'x-i18n': { 'zh-CN': '循环播放' },
      'x-i18n-desc': { 'zh-CN': '是否循环播放' },
    });

const skippable = (defaultValue: boolean) =>
  z
    .boolean()
    .optional()
    .default(defaultValue)
    .describe('Whether it can be skipped')
    .meta({
      title: 'Skippable',
      'x-i18n': { 'zh-CN': '可跳过' },
      'x-i18n-desc': { 'zh-CN': '是否可跳过' },
    });

const noWait = (defaultValue: boolean) =>
  z
    .boolean()
    .optional()
    .default(defaultValue)
    .describe('Whether to skip waiting for the transition to complete')
    .meta({
      title: 'No Wait',
      'x-i18n': { 'zh-CN': '不等待' },
      'x-i18n-desc': { 'zh-CN': '是否跳过等待过渡完成' },
    });

const posX = z
  .number()
  .describe('X coordinate')
  .meta({ title: 'X', 'x-i18n-desc': { 'zh-CN': 'X 坐标' } });

const posY = z
  .number()
  .describe('Y coordinate')
  .meta({ title: 'Y', 'x-i18n-desc': { 'zh-CN': 'Y 坐标' } });

const tint = z
  .string()
  .describe('Color tint')
  .meta({
    title: 'Tint',
    format: 'color',
    'x-i18n': { 'zh-CN': '色调' },
    'x-i18n-desc': { 'zh-CN': '颜色色调' },
  });

const nodeScale = z
  .number()
  .describe('Scale factor')
  .meta({
    title: 'Scale',
    'x-i18n': { 'zh-CN': '缩放' },
    'x-i18n-desc': { 'zh-CN': '缩放系数' },
  });

const nodePivot = z
  .tuple([z.number(), z.number()])
  .describe('Pivot point (x, y) in pixels')
  .meta({
    title: 'Pivot',
    'x-i18n': { 'zh-CN': '旋转中心' },
    'x-i18n-desc': { 'zh-CN': '旋转中心点 (x, y)，单位像素' },
  });

const nodeVisible = z
  .boolean()
  .describe('Whether visible')
  .meta({
    title: 'Visible',
    'x-i18n': { 'zh-CN': '可见' },
    'x-i18n-desc': { 'zh-CN': '是否可见' },
  });

const charName = z
  .string()
  .describe('Character identifier')
  .meta({
    title: 'Name',
    format: 'character',
    'x-i18n': { 'zh-CN': '角色名' },
    'x-i18n-desc': { 'zh-CN': '角色标识符' },
  });

const charPreset = z
  .enum(['left', 'center', 'right'])
  .describe('Position preset: left, center, or right')
  .meta({
    title: 'Preset',
    'x-i18n': { 'zh-CN': '位置预设' },
    'x-i18n-desc': { 'zh-CN': '位置预设，可选 left / center / right' },
  });

const soundChannel = z
  .string()
  .describe('Audio channel name')
  .meta({
    title: 'Channel',
    'x-i18n': { 'zh-CN': '通道' },
    'x-i18n-desc': { 'zh-CN': '音频通道名称' },
  });

const cameraPreset = z
  .enum(CAMERA_PRESET_NAMES)
  .describe('Camera preset name')
  .meta({
    title: 'Preset',
    'x-i18n': { 'zh-CN': '镜头预设' },
    'x-i18n-desc': { 'zh-CN': '镜头预设名称' },
  });

const cameraZoom = z
  .number()
  .min(1)
  .max(2)
  .describe('Camera zoom ratio')
  .meta({
    title: 'Zoom',
    'x-i18n': { 'zh-CN': '镜头缩放' },
    'x-i18n-desc': { 'zh-CN': '镜头缩放倍率' },
  });

const cameraDepth = z
  .number()
  .min(0)
  .max(1)
  .describe('Depth intensity from 0 to 1')
  .meta({
    title: 'Depth',
    'x-i18n': { 'zh-CN': '景深强度' },
    'x-i18n-desc': { 'zh-CN': '景深强度，范围 0 到 1' },
  });

const cameraBlur = z
  .number()
  .min(0)
  .max(8)
  .describe('Background blur radius')
  .meta({
    title: 'Blur',
    'x-i18n': { 'zh-CN': '背景模糊' },
    'x-i18n-desc': { 'zh-CN': '背景模糊半径' },
  });

/** Common character transform properties shared by charEnter / charAction */
const charTransformProps = {
  name: charName.optional(),
  preset: charPreset.optional(),
  x: posX.optional(),
  y: posY.optional(),
  visible: nodeVisible.optional(),
  scale: nodeScale.optional(),
  tint: tint.optional(),
  pivot: nodePivot.optional(),
  fadeTime: fadeTime(500),
  skippable: skippable(false),
  noWait: noWait(true),
};

/* ------------------------------------------------------------------ */
/*  Text Commands                                                      */
/* ------------------------------------------------------------------ */

const TextCommandSchema = z
  .object({
    command: z.literal('text'),
    content: z
      .string()
      .describe('Text content to display')
      .meta({
        title: 'Content',
        'x-i18n': { 'zh-CN': '内容' },
        'x-i18n-desc': { 'zh-CN': '要显示的文本内容' },
      }),
    name: z
      .string()
      .optional()
      .describe('Speaker name')
      .meta({
        title: 'Speaker',
        format: 'character',
        'x-i18n': { 'zh-CN': '说话人' },
        'x-i18n-desc': { 'zh-CN': '说话人名称' },
      }),
    newline: z
      .boolean()
      .optional()
      .default(true)
      .describe('Start a new line before printing the text')
      .meta({
        title: 'New Line',
        'x-i18n': { 'zh-CN': '换行' },
        'x-i18n-desc': { 'zh-CN': '在显示文本前换行' },
      }),
    clear: z
      .boolean()
      .optional()
      .default(true)
      .describe('Clear existing text before printing')
      .meta({
        title: 'Clear',
        'x-i18n': { 'zh-CN': '清除' },
        'x-i18n-desc': { 'zh-CN': '在显示文本前清除已有文本' },
      }),
    autoAdvance: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether to automatically advance after printing')
      .meta({
        title: 'Auto Advance',
        'x-i18n': { 'zh-CN': '自动前进' },
        'x-i18n-desc': { 'zh-CN': '文本显示完成后是否自动前进' },
      }),
    skippable: skippable(true),
  })
  .describe('Display text in the text box')
  .meta({
    title: 'Display Text',
    'x-i18n': { 'zh-CN': '显示文本' },
    'x-i18n-desc': { 'zh-CN': '在文本框中显示文本' },
  });

const TextClearCommandSchema = z
  .object({
    command: z.literal('textClear'),
  })
  .describe('Clear the text box')
  .meta({
    title: 'Clear Text',
    'x-i18n': { 'zh-CN': '清除文本' },
    'x-i18n-desc': { 'zh-CN': '清除文本框内容' },
  });

const TextBoxCommandSchema = z
  .object({
    command: z.literal('textBox'),
    position: z
      .array(z.number())
      .length(2)
      .optional()
      .describe('Text box position (x, y)')
      .meta({
        title: 'Position',
        'x-i18n': { 'zh-CN': '位置' },
        'x-i18n-desc': { 'zh-CN': '文本框位置坐标 (x, y)' },
      }),
    printMode: z
      .enum(['instant', 'typewriter', 'printer'])
      .optional()
      .describe('Text printing mode')
      .meta({
        title: 'Print Mode',
        'x-i18n': { 'zh-CN': '打字模式' },
        'x-i18n-desc': { 'zh-CN': '文本打字模式' },
      }),
    printSpeed: z
      .number()
      .optional()
      .describe('Print speed: chars/sec (typewriter) or lines/sec (printer)')
      .meta({
        title: 'Print Speed',
        'x-i18n': { 'zh-CN': '打字速度' },
        'x-i18n-desc': { 'zh-CN': '逐字模式为字/秒，打印机模式为行/秒' },
      }),
    fillColor: z
      .string()
      .optional()
      .describe('Text color')
      .meta({
        title: 'Text Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '文字颜色' },
        'x-i18n-desc': { 'zh-CN': '文字颜色' },
      }),
    lineHeight: z
      .number()
      .optional()
      .describe('Line height multiplier')
      .meta({
        title: 'Line Height',
        'x-i18n': { 'zh-CN': '行高' },
        'x-i18n-desc': { 'zh-CN': '行高倍数' },
      }),
    indent: z
      .number()
      .optional()
      .describe('First-line indentation in pixels')
      .meta({
        title: 'Indent',
        'x-i18n': { 'zh-CN': '缩进' },
        'x-i18n-desc': { 'zh-CN': '段落首行缩进（像素）' },
      }),
    stroke: z
      .boolean()
      .optional()
      .describe('Whether to apply text stroke')
      .meta({
        title: 'Stroke',
        'x-i18n': { 'zh-CN': '描边' },
        'x-i18n-desc': { 'zh-CN': '是否启用文字描边' },
      }),
    shadow: z
      .boolean()
      .optional()
      .describe('Whether to apply text shadow')
      .meta({
        title: 'Shadow',
        'x-i18n': { 'zh-CN': '阴影' },
        'x-i18n-desc': { 'zh-CN': '是否启用文字阴影' },
      }),
    strokeColor: z
      .string()
      .optional()
      .describe('Stroke color')
      .meta({
        title: 'Stroke Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '描边颜色' },
        'x-i18n-desc': { 'zh-CN': '描边颜色' },
      }),
    strokeWidth: z
      .number()
      .optional()
      .describe('Stroke width in pixels')
      .meta({
        title: 'Stroke Width',
        'x-i18n': { 'zh-CN': '描边宽度' },
        'x-i18n-desc': { 'zh-CN': '描边宽度（像素）' },
      }),
    shadowColor: z
      .string()
      .optional()
      .describe('Shadow color')
      .meta({
        title: 'Shadow Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '阴影颜色' },
        'x-i18n-desc': { 'zh-CN': '阴影颜色' },
      }),
    shadowOffsetX: z
      .number()
      .optional()
      .describe('Shadow X offset in pixels')
      .meta({
        title: 'Shadow Offset X',
        'x-i18n': { 'zh-CN': '阴影偏移 X' },
        'x-i18n-desc': { 'zh-CN': '阴影 X 轴偏移（像素）' },
      }),
    shadowOffsetY: z
      .number()
      .optional()
      .describe('Shadow Y offset in pixels')
      .meta({
        title: 'Shadow Offset Y',
        'x-i18n': { 'zh-CN': '阴影偏移 Y' },
        'x-i18n-desc': { 'zh-CN': '阴影 Y 轴偏移（像素）' },
      }),
    shadowBlur: z
      .number()
      .optional()
      .describe('Shadow blur radius in pixels')
      .meta({
        title: 'Shadow Blur',
        'x-i18n': { 'zh-CN': '阴影模糊' },
        'x-i18n-desc': { 'zh-CN': '阴影模糊半径（像素）' },
      }),
    shadowWidth: z
      .number()
      .optional()
      .describe('Shadow width in pixels, only effective when shadow is enabled')
      .meta({
        title: 'Shadow Width',
        'x-i18n': { 'zh-CN': '阴影宽度' },
        'x-i18n-desc': { 'zh-CN': '阴影宽度（像素），仅在启用阴影时生效' },
      }),
  })
  .describe('Configure text box appearance and behavior')
  .meta({
    title: 'Text Box Settings',
    'x-i18n': { 'zh-CN': '文本框设置' },
    'x-i18n-desc': { 'zh-CN': '配置文本框外观与行为' },
  });

const TextBoxShowCommandSchema = z
  .object({
    command: z.literal('textBoxShow'),
  })
  .describe('Show the text box')
  .meta({
    title: 'Show Text Box',
    'x-i18n': { 'zh-CN': '显示文本框' },
    'x-i18n-desc': { 'zh-CN': '显示文本框' },
  });

const TextBoxHideCommandSchema = z
  .object({
    command: z.literal('textBoxHide'),
  })
  .describe('Hide the text box')
  .meta({
    title: 'Hide Text Box',
    'x-i18n': { 'zh-CN': '隐藏文本框' },
    'x-i18n-desc': { 'zh-CN': '隐藏文本框' },
  });

/* ------------------------------------------------------------------ */
/*  Sound Commands                                                     */
/* ------------------------------------------------------------------ */

const BGMCommandSchema = z
  .object({
    command: z.literal('bgm'),
    src: audioSrc,
    loop: loop(true),
    volume,
    fadeTime: fadeTime(600),
    skippable: skippable(false),
    noWait: noWait(true),
  })
  .describe('Play background music')
  .meta({
    title: 'Play BGM',
    'x-i18n': { 'zh-CN': '播放背景音乐' },
    'x-i18n-desc': { 'zh-CN': '播放背景音乐' },
  });

const BGMStopCommandSchema = z
  .object({
    command: z.literal('bgmStop'),
    fadeTime: fadeTime(600),
    skippable: skippable(false),
    noWait: noWait(true),
  })
  .describe('Stop background music')
  .meta({
    title: 'Stop BGM',
    'x-i18n': { 'zh-CN': '停止背景音乐' },
    'x-i18n-desc': { 'zh-CN': '停止播放背景音乐' },
  });

const SFXCommandSchema = z
  .object({
    command: z.literal('sfx'),
    src: audioSrc,
    loop: loop(false),
    volume,
    fadeTime: fadeTime(600),
    skippable: skippable(false),
    noWait: noWait(true),
  })
  .describe('Play a sound effect')
  .meta({
    title: 'Play SFX',
    'x-i18n': { 'zh-CN': '播放音效' },
    'x-i18n-desc': { 'zh-CN': '播放一个音效' },
  });

const SFXStopCommandSchema = z
  .object({
    command: z.literal('sfxStop'),
    fadeTime: fadeTime(600),
    skippable: skippable(false),
    noWait: noWait(true),
  })
  .describe('Stop sound effects')
  .meta({
    title: 'Stop SFX',
    'x-i18n': { 'zh-CN': '停止音效' },
    'x-i18n-desc': { 'zh-CN': '停止播放音效' },
  });

const VoiceCommandSchema = z
  .object({
    command: z.literal('voice'),
    src: audioSrc,
    name: z
      .string()
      .optional()
      .describe('Voice channel name')
      .meta({
        title: 'Channel',
        'x-i18n': { 'zh-CN': '通道' },
        'x-i18n-desc': { 'zh-CN': '语音通道名称' },
      }),
    volume,
  })
  .describe('Play voice audio')
  .meta({
    title: 'Play Voice',
    'x-i18n': { 'zh-CN': '播放语音' },
    'x-i18n-desc': { 'zh-CN': '播放语音音频' },
  });

const VoiceStopCommandSchema = z
  .object({
    command: z.literal('voiceStop'),
    name: z
      .string()
      .optional()
      .describe('Voice channel name to stop')
      .meta({
        title: 'Channel',
        'x-i18n': { 'zh-CN': '通道' },
        'x-i18n-desc': { 'zh-CN': '要停止的语音通道名称' },
      }),
  })
  .describe('Stop voice playback')
  .meta({
    title: 'Stop Voice',
    'x-i18n': { 'zh-CN': '停止语音' },
    'x-i18n-desc': { 'zh-CN': '停止语音播放' },
  });

const SoundCommandSchema = z
  .object({
    command: z.literal('sound'),
    channel: soundChannel,
    src: audioSrc,
    loop: loop(false),
    volume,
    fadeTime: fadeTime(600),
    skippable: skippable(false),
    noWait: noWait(true),
  })
  .describe('Play audio on a named channel')
  .meta({
    title: 'Play Sound',
    'x-i18n': { 'zh-CN': '播放音频' },
    'x-i18n-desc': { 'zh-CN': '在指定通道播放音频' },
  });

const SoundStopCommandSchema = z
  .object({
    command: z.literal('soundStop'),
    channel: soundChannel,
    fadeTime: fadeTime(600),
    skippable: skippable(false),
    noWait: noWait(true),
  })
  .describe('Stop audio on a named channel')
  .meta({
    title: 'Stop Sound',
    'x-i18n': { 'zh-CN': '停止音频' },
    'x-i18n-desc': { 'zh-CN': '停止指定通道的音频' },
  });

/* ------------------------------------------------------------------ */
/*  Video Commands                                                     */
/* ------------------------------------------------------------------ */

const VideoCommandSchema = z
  .object({
    command: z.literal('video'),
    src: videoSrc,
    fadeTime: fadeTime(0),
    skippable: skippable(false),
  })
  .describe('Play a fullscreen video that blocks the scenario until completion')
  .meta({
    title: 'Play Video',
    'x-i18n': { 'zh-CN': '播放视频' },
    'x-i18n-desc': { 'zh-CN': '播放全屏视频，期间阻塞剧情' },
  });

/* ------------------------------------------------------------------ */
/*  Background Commands                                                */
/* ------------------------------------------------------------------ */

const BgCommandSchema = z
  .object({
    command: z.literal('bg'),
    src: imageSrc,
    fadeTime: fadeTime(1000),
    skippable: skippable(false),
    noWait: noWait(false),
  })
  .describe('Change background image')
  .meta({
    title: 'Change Background',
    'x-i18n': { 'zh-CN': '切换背景' },
    'x-i18n-desc': { 'zh-CN': '切换背景图片' },
  });

const BgTintCommandSchema = z
  .object({
    command: z.literal('bgTint'),
    tint,
    fadeTime: fadeTime(1000),
    skippable: skippable(false),
    noWait: noWait(false),
  })
  .describe('Set background tint color')
  .meta({
    title: 'Set Background Tint',
    'x-i18n': { 'zh-CN': '设置背景色调' },
    'x-i18n-desc': { 'zh-CN': '设置背景的色调颜色' },
  });

const CameraCommandSchema = z
  .object({
    command: z.literal('camera'),
    preset: cameraPreset.optional(),
    x: posX.optional(),
    y: posY.optional(),
    zoom: cameraZoom.optional(),
    depth: cameraDepth.optional(),
    blur: cameraBlur.optional(),
    fadeTime: fadeTime(600),
    skippable: skippable(false),
    noWait: noWait(false),
  })
  .describe('Move the stage camera with parallax and background blur')
  .meta({
    title: 'Camera',
    'x-i18n': { 'zh-CN': '景深镜头' },
    'x-i18n-desc': { 'zh-CN': '设置镜头焦点、推近、景深和背景模糊' },
  });

/* ------------------------------------------------------------------ */
/*  Character Commands                                                 */
/* ------------------------------------------------------------------ */

const CharEnterCommandSchema = z
  .object({
    command: z.literal('charEnter'),
    src: imageSrc,
    ...charTransformProps,
  })
  .describe('Add a character to the stage')
  .meta({
    title: 'Add Character',
    'x-i18n': { 'zh-CN': '添加角色' },
    'x-i18n-desc': { 'zh-CN': '将角色添加到舞台' },
  });

const CharActionCommandSchema = z
  .object({
    command: z.literal('charAction'),
    src: imageSrc.optional(),
    ...charTransformProps,
  })
  .describe('Change a character on the stage')
  .meta({
    title: 'Change Character',
    'x-i18n': { 'zh-CN': '更改角色' },
    'x-i18n-desc': { 'zh-CN': '更改舞台上的角色' },
  });

const CharLeaveCommandSchema = z
  .object({
    command: z.literal('charLeave'),
    name: charName.optional(),
    fadeTime: fadeTime(500),
    skippable: skippable(false),
    noWait: noWait(true),
  })
  .describe('Remove a character from the stage')
  .meta({
    title: 'Remove Character',
    'x-i18n': { 'zh-CN': '移除角色' },
    'x-i18n-desc': { 'zh-CN': '从舞台移除角色' },
  });

const CharClearCommandSchema = z
  .object({
    command: z.literal('charClear'),
    fadeTime: fadeTime(500),
    skippable: skippable(false),
    noWait: noWait(true),
  })
  .describe('Remove all characters from the stage')
  .meta({
    title: 'Clear Characters',
    'x-i18n': { 'zh-CN': '清除角色' },
    'x-i18n-desc': { 'zh-CN': '移除舞台上所有角色' },
  });

const CharNameCommandSchema = z
  .object({
    command: z.literal('charName'),
    name: charName.optional(),
    to: z
      .string()
      .describe('New display name for the character')
      .meta({
        title: 'New Name',
        'x-i18n': { 'zh-CN': '新名称' },
        'x-i18n-desc': { 'zh-CN': '角色的新显示名称' },
      }),
  })
  .describe("Change a character's display name")
  .meta({
    title: 'Rename Character',
    'x-i18n': { 'zh-CN': '设置角色名' },
    'x-i18n-desc': { 'zh-CN': '更改角色的显示名称' },
  });

const CharPresetCommandSchema = z
  .object({
    command: z.literal('charPreset'),
    preset: z
      .string()
      .describe('Preset name to define or modify')
      .meta({
        title: 'Preset Name',
        'x-i18n': { 'zh-CN': '预设名' },
        'x-i18n-desc': { 'zh-CN': '要定义或修改的预设名称' },
      }),
    x: posX.optional(),
    y: posY.optional(),
    scale: nodeScale.optional(),
    tint: tint.optional(),
    visible: nodeVisible.optional(),
    pivot: nodePivot.optional(),
    fadeTime: fadeTimeOpt,
  })
  .describe('Define or modify a character preset')
  .meta({
    title: 'Character Preset',
    'x-i18n': { 'zh-CN': '角色预设' },
    'x-i18n-desc': { 'zh-CN': '定义或修改角色预设' },
  });

const CharAutoTintCommandSchema = z
  .object({
    command: z.literal('charAutoTint'),
    enabled: z
      .boolean()
      .optional()
      .describe('Whether to enable auto tinting')
      .meta({
        title: 'Enabled',
        'x-i18n': { 'zh-CN': '启用' },
        'x-i18n-desc': { 'zh-CN': '是否启用自动色调' },
      }),
    tint: tint.optional(),
  })
  .describe('Set the tint color applied to non-speaking characters')
  .meta({
    title: 'Character Auto Tint',
    'x-i18n': { 'zh-CN': '角色自动色调' },
    'x-i18n-desc': { 'zh-CN': '设置非当前发言角色的色调颜色' },
  });

/* ------------------------------------------------------------------ */
/*  Flow Control Commands                                              */
/* ------------------------------------------------------------------ */

const WaitCommandSchema = z
  .object({
    command: z.literal('wait'),
    time: z
      .number()
      .describe('Wait duration in milliseconds')
      .meta({
        title: 'Duration',
        'x-i18n': { 'zh-CN': '时长' },
        'x-i18n-desc': { 'zh-CN': '等待时长（毫秒）' },
      }),
    skippable: z
      .boolean()
      .optional()
      .describe('Whether the wait can be skipped')
      .meta({
        title: 'Skippable',
        'x-i18n': { 'zh-CN': '可跳过' },
        'x-i18n-desc': { 'zh-CN': '是否可跳过等待' },
      }),
  })
  .describe('Wait for a specified duration')
  .meta({
    title: 'Wait',
    'x-i18n': { 'zh-CN': '等待' },
    'x-i18n-desc': { 'zh-CN': '等待指定时长' },
  });

const WaitClickCommandSchema = z
  .object({
    command: z.literal('waitClick'),
  })
  .describe('Wait for a player click')
  .meta({
    title: 'Wait for Click',
    'x-i18n': { 'zh-CN': '等待点击' },
    'x-i18n-desc': { 'zh-CN': '等待玩家点击' },
  });

/* ------------------------------------------------------------------ */
/*  Misc Commands                                                      */
/* ------------------------------------------------------------------ */

const LeaveStageCommandSchema = z
  .object({
    command: z.literal('leaveStage'),
    gotoPage: z
      .string()
      .describe('Target page to navigate to')
      .meta({
        title: 'Target Page',
        'x-i18n': { 'zh-CN': '目标页面' },
        'x-i18n-desc': { 'zh-CN': '离开舞台后跳转的目标页面' },
      }),
  })
  .describe('Leave the stage and navigate to another page')
  .meta({
    title: 'Leave Stage',
    'x-i18n': { 'zh-CN': '离开舞台' },
    'x-i18n-desc': { 'zh-CN': '离开舞台并跳转到其他页面' },
  });

const TitleCommandSchema = z
  .object({
    command: z.literal('title'),
    text: z
      .string()
      .describe('Title text to display')
      .meta({
        title: 'Text',
        'x-i18n': { 'zh-CN': '文本' },
        'x-i18n-desc': { 'zh-CN': '要显示的标题文本' },
      }),
  })
  .describe('Set the window or scene title')
  .meta({
    title: 'Set Title',
    'x-i18n': { 'zh-CN': '设置标题' },
    'x-i18n-desc': { 'zh-CN': '设置窗口或场景标题' },
  });

/* ------------------------------------------------------------------ */
/*  Option Commands                                                   */
/* ------------------------------------------------------------------ */

const OptionAddCommandSchema = z
  .object({
    command: z.literal('optionAdd'),
    text: z
      .string()
      .describe('Display text for the selection option')
      .meta({
        title: 'Text',
        'x-i18n': { 'zh-CN': '文本' },
        'x-i18n-desc': { 'zh-CN': '选项的显示文本' },
      }),
    value: z
      .union([z.string(), z.number()])
      .describe('Value associated with the selection option')
      .meta({
        title: 'Value',
        'x-i18n': { 'zh-CN': '值' },
        'x-i18n-desc': { 'zh-CN': '选项关联的值' },
      }),
  })
  .describe('Add a selection option to the pending list')
  .meta({
    title: 'Add Selection',
    'x-i18n': { 'zh-CN': '添加选项' },
    'x-i18n-desc': { 'zh-CN': '添加一个选项到待选列表' },
  });

const OptionShowCommandSchema = z
  .object({
    command: z.literal('optionShow'),
    saveTo: z
      .string()
      .optional()
      .describe('Variable name to save the selected value to')
      .meta({
        title: 'Save To',
        'x-i18n': { 'zh-CN': '存储变量' },
        'x-i18n-desc': { 'zh-CN': '保存选择结果的变量名' },
      }),
  })
  .describe('Show all pending selection options and wait for the player to choose')
  .meta({
    title: 'Show Selections',
    'x-i18n': { 'zh-CN': '显示选项' },
    'x-i18n-desc': { 'zh-CN': '显示所有待选选项并等待玩家选择' },
  });

const OptionClearCommandSchema = z
  .object({
    command: z.literal('optionClear'),
  })
  .describe('Clear all pending selection options without showing them')
  .meta({
    title: 'Clear Selections',
    'x-i18n': { 'zh-CN': '清除选项' },
    'x-i18n-desc': { 'zh-CN': '清除所有待选选项（不显示）' },
  });

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

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
  VideoCommandSchema,
  BgCommandSchema,
  BgTintCommandSchema,
  CameraCommandSchema,
  CharEnterCommandSchema,
  CharActionCommandSchema,
  CharLeaveCommandSchema,
  CharClearCommandSchema,
  CharNameCommandSchema,
  CharPresetCommandSchema,
  CharAutoTintCommandSchema,
  WaitCommandSchema,
  WaitClickCommandSchema,
  LeaveStageCommandSchema,
  TitleCommandSchema,
  OptionAddCommandSchema,
  OptionShowCommandSchema,
  OptionClearCommandSchema,
]);

export type ScenarioCommandSchemaType = z.infer<typeof ScenarioCommandSchema>;
