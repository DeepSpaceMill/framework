import z from 'zod';

const buttonIdleSrc = z
  .string()
  .describe('Idle state image')
  .meta({
    title: 'Idle',
    format: 'asset',
    'x-asset-kind': 'image',
    'x-i18n': { 'zh-CN': '空闲' },
    'x-i18n-desc': { 'zh-CN': '按钮空闲状态的图片' },
  });

const buttonHoverSrc = z
  .string()
  .describe('Hover state image')
  .meta({
    title: 'Hover',
    format: 'asset',
    'x-asset-kind': 'image',
    'x-i18n': { 'zh-CN': '悬停' },
    'x-i18n-desc': { 'zh-CN': '按钮悬停状态的图片' },
  });

const buttonPressedSrc = z
  .string()
  .describe('Pressed state image')
  .meta({
    title: 'Pressed',
    format: 'asset',
    'x-asset-kind': 'image',
    'x-i18n': { 'zh-CN': '按下' },
    'x-i18n-desc': { 'zh-CN': '按钮按下状态的图片' },
  });

const buttonSrc = z
  .tuple([buttonIdleSrc, buttonHoverSrc, buttonPressedSrc])
  .describe('Button images in idle, hover, and pressed states')
  .meta({
    title: 'Button Images',
    'x-i18n': { 'zh-CN': '按钮图片' },
    'x-i18n-desc': { 'zh-CN': '按钮空闲、悬停和按下状态的图片' },
  });

const posX = z.number().meta({
  title: 'X',
  'x-i18n': { 'zh-CN': 'X 坐标' },
});

const posY = z.number().meta({
  title: 'Y',
  'x-i18n': { 'zh-CN': 'Y 坐标' },
});

const positionSchema = z
  .object({
    x: posX,
    y: posY,
  })
  .meta({
    title: 'Coordinates',
    'x-i18n': { 'zh-CN': '坐标' },
    format: 'position',
  });

const boxWidth = z
  .number()
  .min(0)
  .describe('Text box width in pixels')
  .meta({
    title: 'Box Width',
    'x-i18n': { 'zh-CN': '文本框宽度' },
    'x-i18n-desc': { 'zh-CN': '文本区域宽度（像素）' },
  });

const boxHeight = z
  .number()
  .min(0)
  .describe('Text box height in pixels')
  .meta({
    title: 'Box Height',
    'x-i18n': { 'zh-CN': '文本框高度' },
    'x-i18n-desc': { 'zh-CN': '文本区域高度（像素）' },
  });

const pivotSchema = z
  .tuple([z.number(), z.number()])
  .describe('Pivot point (x, y)')
  .meta({
    title: 'Pivot',
    'x-i18n': { 'zh-CN': '旋转中心' },
    'x-i18n-desc': { 'zh-CN': '节点旋转和定位的锚点' },
  });

const anchorSchema = z
  .tuple([z.number(), z.number()])
  .describe('Anchor point (x, y)')
  .meta({
    title: 'Anchor',
    'x-i18n': { 'zh-CN': '锚点' },
    'x-i18n-desc': { 'zh-CN': '节点对齐使用的锚点' },
  });

export const TextStyleUiSchema = z
  .object({
    fontSize: z
      .number()
      .optional()
      .default(32)
      .describe('Text font size')
      .meta({
        title: 'Font Size',
        'x-i18n': { 'zh-CN': '字号' },
        'x-i18n-desc': { 'zh-CN': '文本字号' },
      }),
    fillColor: z
      .string()
      .optional()
      .default('#f0f0f0')
      .describe('Text color')
      .meta({
        title: 'Fill Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '文字颜色' },
        'x-i18n-desc': { 'zh-CN': '文字填充颜色' },
      }),
    lineHeight: z
      .number()
      .optional()
      .default(1.5)
      .describe('Line height multiplier')
      .meta({
        title: 'Line Height',
        'x-i18n': { 'zh-CN': '行高' },
        'x-i18n-desc': { 'zh-CN': '行高倍数' },
      }),
    indent: z
      .number()
      .optional()
      .default(0)
      .describe('First-line indentation in pixels')
      .meta({
        title: 'Indent',
        'x-i18n': { 'zh-CN': '缩进' },
        'x-i18n-desc': { 'zh-CN': '段落首行缩进（像素）' },
      }),
    stroke: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether to apply text stroke')
      .meta({
        title: 'Stroke',
        'x-i18n': { 'zh-CN': '描边' },
        'x-i18n-desc': { 'zh-CN': '是否启用文字描边' },
      }),
    strokeColor: z
      .string()
      .optional()
      .default('#000000')
      .describe('Stroke color')
      .meta({
        title: 'Stroke Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '描边颜色' },
        'x-i18n-desc': { 'zh-CN': '文字描边颜色' },
      }),
    strokeWidth: z
      .number()
      .optional()
      .default(2)
      .describe('Stroke width in pixels')
      .meta({
        title: 'Stroke Width',
        'x-i18n': { 'zh-CN': '描边宽度' },
        'x-i18n-desc': { 'zh-CN': '文字描边宽度（像素）' },
      }),
    shadow: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether to apply text shadow')
      .meta({
        title: 'Shadow',
        'x-i18n': { 'zh-CN': '阴影' },
        'x-i18n-desc': { 'zh-CN': '是否启用文字阴影' },
      }),
    shadowColor: z
      .string()
      .optional()
      .default('#000000')
      .describe('Shadow color')
      .meta({
        title: 'Shadow Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '阴影颜色' },
        'x-i18n-desc': { 'zh-CN': '文字阴影颜色' },
      }),
    shadowOffsetX: z
      .number()
      .optional()
      .default(0)
      .describe('Shadow X offset in pixels')
      .meta({
        title: 'Shadow Offset X',
        'x-i18n': { 'zh-CN': '阴影偏移 X' },
        'x-i18n-desc': { 'zh-CN': '阴影 X 轴偏移（像素）' },
      }),
    shadowOffsetY: z
      .number()
      .optional()
      .default(0)
      .describe('Shadow Y offset in pixels')
      .meta({
        title: 'Shadow Offset Y',
        'x-i18n': { 'zh-CN': '阴影偏移 Y' },
        'x-i18n-desc': { 'zh-CN': '阴影 Y 轴偏移（像素）' },
      }),
    shadowBlur: z
      .number()
      .optional()
      .default(0)
      .describe('Shadow blur radius in pixels')
      .meta({
        title: 'Shadow Blur',
        'x-i18n': { 'zh-CN': '阴影模糊' },
        'x-i18n-desc': { 'zh-CN': '阴影模糊半径（像素）' },
      }),
    shadowWidth: z
      .number()
      .optional()
      .default(0)
      .describe('Shadow width in pixels, only effective when shadow is enabled')
      .meta({
        title: 'Shadow Width',
        'x-i18n': { 'zh-CN': '阴影宽度' },
        'x-i18n-desc': { 'zh-CN': '阴影宽度（像素），仅在启用阴影时生效' },
      }),
  })
  .describe('Text style configuration')
  .meta({
    title: 'Text Style',
    'x-i18n': { 'zh-CN': '文字样式' },
    'x-i18n-desc': { 'zh-CN': '文本渲染使用的样式配置' },
  });

const printModeUiSchema = z
  .enum(['instant', 'typewriter', 'printer'])
  .optional()
  .default('typewriter')
  .describe('Default text printing mode')
  .meta({
    title: 'Print Mode',
    'x-i18n': { 'zh-CN': '打字模式' },
    'x-i18n-desc': { 'zh-CN': '正文默认的文字打印模式' },
  });

const printSpeedUiSchema = z
  .number()
  .optional()
  .default(20)
  .describe('Default print speed: chars/sec (typewriter) or lines/sec (printer)')
  .meta({
    title: 'Print Speed',
    'x-i18n': { 'zh-CN': '打字速度' },
    'x-i18n-desc': { 'zh-CN': '正文默认的打印速度；逐字模式为字/秒，打印机模式为行/秒' },
  });

const ninesliceBoundsSchema = z
  .tuple([z.number(), z.number(), z.number(), z.number()])
  .describe('Nine-slice bounds [left, top, right, bottom]')
  .meta({
    title: 'Bounds',
    'x-i18n': { 'zh-CN': '九宫格边界' },
    'x-i18n-desc': { 'zh-CN': '九宫格缩放使用的边界 [left, top, right, bottom]' },
  });

const TextboxImageNormalUiSchema = z
  .object({
    type: z.literal('normal'),
    src: z
      .string()
      .describe('Image asset path')
      .meta({
        title: 'Image',
        format: 'asset',
        'x-asset-kind': 'image',
        'x-i18n': { 'zh-CN': '图片' },
        'x-i18n-desc': { 'zh-CN': '图片资源路径' },
      }),
    position: positionSchema,
    anchor: anchorSchema.optional().default([0, 0]),
    pivot: pivotSchema.optional().default([0, 0]),
  })
  .describe('Normal textbox image')
  .meta({
    title: 'Normal Image',
    'x-i18n': { 'zh-CN': '普通图片' },
    'x-i18n-desc': { 'zh-CN': '使用普通图片渲染文本框背景' },
  });

const TextboxImageNinesliceUiSchema = z
  .object({
    type: z.literal('nineslice'),
    src: z
      .string()
      .describe('Image asset path')
      .meta({
        title: 'Image',
        format: 'asset',
        'x-asset-kind': 'image',
        'x-i18n': { 'zh-CN': '图片' },
        'x-i18n-desc': { 'zh-CN': '图片资源路径' },
      }),
    position: positionSchema,
    anchor: anchorSchema.optional().default([0, 0]),
    pivot: pivotSchema.optional().default([0, 0]),
    bounds: ninesliceBoundsSchema,
    targetWidth: z
      .number()
      .min(0)
      .optional()
      .describe('Target width for the nineslice image')
      .meta({
        title: 'Target Width',
        'x-i18n': { 'zh-CN': '目标宽度' },
        'x-i18n-desc': { 'zh-CN': '九宫格图片的目标宽度' },
      }),
    targetHeight: z
      .number()
      .min(0)
      .optional()
      .describe('Target height for the nineslice image')
      .meta({
        title: 'Target Height',
        'x-i18n': { 'zh-CN': '目标高度' },
        'x-i18n-desc': { 'zh-CN': '九宫格图片的目标高度' },
      }),
  })
  .describe('Nineslice textbox image')
  .meta({
    title: 'Nine-slice Image',
    'x-i18n': { 'zh-CN': '九宫格图片' },
    'x-i18n-desc': { 'zh-CN': '使用九宫格方式渲染文本框背景' },
  });

const TextboxImageUiSchema = z
  .discriminatedUnion('type', [TextboxImageNormalUiSchema, TextboxImageNinesliceUiSchema])
  .describe('Textbox image configuration')
  .meta({
    title: 'Background',
    'x-i18n': { 'zh-CN': '背景' },
    'x-i18n-desc': { 'zh-CN': '文本框背景图片配置' },
  });

const textboxButtonTextColorSchema = z
  .union([
    z.string(),
    z.tuple([z.string(), z.string(), z.string()]),
  ])
  .describe('Button text color, either a single color or colors for idle/hover/pressed states')
  .meta({
    title: 'Color',
    format: 'color',
    'x-i18n': { 'zh-CN': '颜色' },
    'x-i18n-desc': { 'zh-CN': '按钮文字颜色，可以是单色或空闲/悬停/按下三态颜色' },
  });

const TextBoxButtonActionUiSchema = z
  .enum(['QSAV', 'QLOD', 'SAVE', 'LOAD', 'AUTO', 'SKIP', 'LOG', 'MENU'])
  .describe('Textbox button action')
  .meta({
    title: 'Action',
    'x-i18n': { 'zh-CN': '动作' },
    'x-i18n-desc': { 'zh-CN': '按钮点击后触发的文本框动作' },
  });

const TextBoxActionButtonUiSchema = z
  .object({
    action: TextBoxButtonActionUiSchema,
    position: positionSchema,
    fileNames: buttonSrc,
    text: z
      .string()
      .describe('Button label')
      .meta({
        title: 'Text',
        'x-i18n': { 'zh-CN': '文字' },
        'x-i18n-desc': { 'zh-CN': '按钮上显示的文字' },
      }),
    fontSize: z
      .number()
      .optional()
      .default(24)
      .describe('Button font size')
      .meta({
        title: 'Font Size',
        'x-i18n': { 'zh-CN': '字号' },
        'x-i18n-desc': { 'zh-CN': '按钮文字字号' },
      }),
    color: textboxButtonTextColorSchema.optional().default([
      'rgba(255,255,255,0.3)',
      'rgba(255,255,255,0.7)',
      'rgba(255,255,255,0.9)',
    ]),
    anchor: anchorSchema.optional(),
    pivot: pivotSchema.optional(),
    textOffsetX: z
      .number()
      .optional()
      .describe('Horizontal text offset inside the button')
      .meta({
        title: 'Text Offset X',
        'x-i18n': { 'zh-CN': '文字偏移 X' },
        'x-i18n-desc': { 'zh-CN': '按钮内文字的水平偏移' },
      }),
    textOffsetY: z
      .number()
      .optional()
      .describe('Vertical text offset inside the button')
      .meta({
        title: 'Text Offset Y',
        'x-i18n': { 'zh-CN': '文字偏移 Y' },
        'x-i18n-desc': { 'zh-CN': '按钮内文字的垂直偏移' },
      }),
    lockOnActive: z
      .boolean()
      .optional()
      .default(false)
      .describe('Whether to lock the button to the pressed state while its action is active')
      .meta({
        title: 'Lock On Active',
        'x-i18n': { 'zh-CN': '激活时锁定' },
        'x-i18n-desc': { 'zh-CN': '当对应动作处于激活状态时，是否锁定为按下态' },
      }),
  })
  .describe('Textbox action button configuration')
  .meta({
    title: 'Button',
    'x-i18n': { 'zh-CN': '按钮' },
    'x-i18n-desc': { 'zh-CN': '文本框动作按钮配置' },
  });

const TitlePageNameSchema = z
  .enum(['stage', 'cg', 'bgm', 'credits'])
  .describe('Target page name')
  .meta({
    title: 'Page',
    'x-i18n': { 'zh-CN': '页面' },
    'x-i18n-desc': { 'zh-CN': '跳转的页面名称' },
  });

const TitleOverlayNameSchema = z
  .enum(['saveload', 'settings'])
  .describe('Target overlay name')
  .meta({
    title: 'Overlay',
    'x-i18n': { 'zh-CN': '浮层' },
    'x-i18n-desc': { 'zh-CN': '弹出的浮层名称' },
  });

const TitleGotoPageActionUiSchema = z
  .object({
    type: z.literal('gotoPage'),
    name: TitlePageNameSchema,
  })
  .describe('Navigate to another page')
  .meta({
    title: 'Go To Page',
    'x-i18n': { 'zh-CN': '跳转页面' },
    'x-i18n-desc': { 'zh-CN': '点击按钮后跳转到指定页面' },
  });

const TitlePushOverlayActionUiSchema = z
  .object({
    type: z.literal('pushOverlay'),
    name: TitleOverlayNameSchema,
  })
  .describe('Open an overlay')
  .meta({
    title: 'Push Overlay',
    'x-i18n': { 'zh-CN': '打开浮层' },
    'x-i18n-desc': { 'zh-CN': '点击按钮后打开指定浮层' },
  });

const TitleQuitActionUiSchema = z
  .object({
    type: z.literal('quit'),
  })
  .describe('Quit the game')
  .meta({
    title: 'Quit',
    'x-i18n': { 'zh-CN': '退出游戏' },
    'x-i18n-desc': { 'zh-CN': '点击按钮后退出游戏' },
  });

export const TitleButtonActionUiSchema = z
  .discriminatedUnion('type', [TitleGotoPageActionUiSchema, TitlePushOverlayActionUiSchema, TitleQuitActionUiSchema])
  .describe('Title button action')
  .meta({
    title: 'Action',
    'x-i18n': { 'zh-CN': '动作' },
    'x-i18n-desc': { 'zh-CN': '标题按钮执行的动作' },
  });

const MenuResumeActionUiSchema = z
  .object({
    type: z.literal('resume'),
  })
  .describe('Close the menu overlay and resume the game')
  .meta({
    title: 'Resume',
    'x-i18n': { 'zh-CN': '继续游戏' },
    'x-i18n-desc': { 'zh-CN': '关闭菜单并继续游戏' },
  });

const MenuSettingsActionUiSchema = z
  .object({
    type: z.literal('settings'),
  })
  .describe('Open the settings overlay from the menu')
  .meta({
    title: 'Open Settings',
    'x-i18n': { 'zh-CN': '打开设置' },
    'x-i18n-desc': { 'zh-CN': '从菜单中打开设置界面' },
  });

const MenuTitleActionUiSchema = z
  .object({
    type: z.literal('title'),
  })
  .describe('Return to the title screen')
  .meta({
    title: 'Return To Title',
    'x-i18n': { 'zh-CN': '回到主界面' },
    'x-i18n-desc': { 'zh-CN': '返回标题界面' },
  });

const MenuQuitActionUiSchema = z
  .object({
    type: z.literal('quit'),
  })
  .describe('Quit the game from the menu')
  .meta({
    title: 'Quit Game',
    'x-i18n': { 'zh-CN': '退出游戏' },
    'x-i18n-desc': { 'zh-CN': '从菜单中退出游戏' },
  });

export const MenuButtonActionUiSchema = z
  .discriminatedUnion('type', [
    MenuResumeActionUiSchema,
    MenuSettingsActionUiSchema,
    MenuTitleActionUiSchema,
    MenuQuitActionUiSchema,
  ])
  .describe('Menu button action')
  .meta({
    title: 'Action',
    'x-i18n': { 'zh-CN': '动作' },
    'x-i18n-desc': { 'zh-CN': '菜单按钮执行的动作' },
  });

const OverlayIconButtonUiSchema = z
  .object({
    position: positionSchema,
    fileNames: buttonSrc,
  })
  .describe('Overlay icon button')
  .meta({
    title: 'Button',
    'x-i18n': { 'zh-CN': '按钮' },
    'x-i18n-desc': { 'zh-CN': '浮层中的图标按钮配置' },
  });

const OverlayTextButtonUiSchema = z
  .object({
    position: positionSchema,
    fileNames: buttonSrc,
    text: z
      .string()
      .describe('Button label')
      .meta({
        title: 'Text',
        'x-i18n': { 'zh-CN': '文字' },
        'x-i18n-desc': { 'zh-CN': '按钮上显示的文字' },
      }),
    color: z
      .string()
      .optional()
      .default('#ffffff')
      .describe('Button text color')
      .meta({
        title: 'Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '颜色' },
        'x-i18n-desc': { 'zh-CN': '按钮文字颜色' },
      }),
    fontSize: z
      .number()
      .optional()
      .default(36)
      .describe('Button font size')
      .meta({
        title: 'Font Size',
        'x-i18n': { 'zh-CN': '字号' },
        'x-i18n-desc': { 'zh-CN': '按钮文字字号' },
      }),
  })
  .describe('Overlay text button')
  .meta({
    title: 'Button',
    'x-i18n': { 'zh-CN': '按钮' },
    'x-i18n-desc': { 'zh-CN': '浮层中的文字按钮配置' },
  });

export const TitleButtonUiSchema = z
  .object({
    position: positionSchema,
    fileNames: buttonSrc,
    text: z
      .string()
      .describe('Button label')
      .meta({
        title: 'Text',
        'x-i18n': { 'zh-CN': '文字' },
        'x-i18n-desc': { 'zh-CN': '按钮上显示的文字' },
      }),
    fontSize: z
      .number()
      .optional()
      .default(36)
      .describe('Button font size')
      .meta({
        title: 'Font Size',
        'x-i18n': { 'zh-CN': '字号' },
        'x-i18n-desc': { 'zh-CN': '按钮文字字号' },
      }),
    color: z
      .string()
      .optional()
      .default('#ffffff')
      .describe('Button text color')
      .meta({
        title: 'Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '颜色' },
        'x-i18n-desc': { 'zh-CN': '按钮文字颜色' },
      }),
    action: TitleButtonActionUiSchema,
  })
  .describe('Title screen button')
  .meta({
    title: 'Button',
    'x-i18n': { 'zh-CN': '按钮' },
    'x-i18n-desc': { 'zh-CN': '标题界面上的一个按钮配置' },
  });

export const MenuButtonUiSchema = z
  .object({
    position: positionSchema,
    fileNames: buttonSrc,
    text: z
      .string()
      .describe('Button label')
      .meta({
        title: 'Text',
        'x-i18n': { 'zh-CN': '文字' },
        'x-i18n-desc': { 'zh-CN': '按钮上显示的文字' },
      }),
    color: z
      .string()
      .optional()
      .default('#f0f0f0')
      .describe('Button text color')
      .meta({
        title: 'Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '颜色' },
        'x-i18n-desc': { 'zh-CN': '按钮文字颜色' },
      }),
    action: MenuButtonActionUiSchema,
  })
  .describe('Menu button configuration')
  .meta({
    title: 'Button',
    'x-i18n': { 'zh-CN': '按钮' },
    'x-i18n-desc': { 'zh-CN': '菜单中的一个按钮配置' },
  });

export const TitleUiSchema = z
  .object({
    background: z
      .string()
      .describe('Title screen background image')
      .meta({
        title: 'Background',
        format: 'asset',
        'x-asset-kind': 'image',
        'x-i18n': { 'zh-CN': '背景图' },
        'x-i18n-desc': { 'zh-CN': '标题界面的背景图片' },
      }),
    fadeTime: z
      .number()
      .optional()
      .default(500)
      .describe('Fade-in time in milliseconds')
      .meta({
        title: 'Fade Time',
        'x-i18n': { 'zh-CN': '淡入时间' },
        'x-i18n-desc': { 'zh-CN': '标题界面的淡入时间（毫秒）' },
      }),
    buttonHoverSound: z
      .string()
      .optional()
      .describe('Sound effect played when hovering a title button')
      .meta({
        title: 'Button Hover Sound',
        format: 'asset',
        'x-asset-kind': 'audio',
        'x-i18n': { 'zh-CN': '按钮悬停音效' },
        'x-i18n-desc': { 'zh-CN': '鼠标悬停到标题界面按钮时播放的音效' },
      }),
    buttonClickSound: z
      .string()
      .optional()
      .describe('Sound effect played when clicking a title button')
      .meta({
        title: 'Button Click Sound',
        format: 'asset',
        'x-asset-kind': 'audio',
        'x-i18n': { 'zh-CN': '按钮点击音效' },
        'x-i18n-desc': { 'zh-CN': '点击标题界面按钮时播放的音效' },
      }),
    buttons: z
      .array(TitleButtonUiSchema)
      .min(1)
      .describe('Title screen buttons')
      .meta({
        title: 'Buttons',
        'x-i18n': { 'zh-CN': '按钮列表' },
        'x-i18n-desc': { 'zh-CN': '标题界面的按钮列表' },
      }),
  })
  .describe('Title screen UI configuration')
  .meta({
    title: 'Title Screen',
    'x-i18n': { 'zh-CN': '标题界面' },
    'x-i18n-desc': { 'zh-CN': '标题界面的可配置数据' },
  });

export const MenuUiSchema = z
  .object({
    background: z
      .string()
      .describe('Menu background image')
      .meta({
        title: 'Background',
        format: 'asset',
        'x-asset-kind': 'image',
        'x-i18n': { 'zh-CN': '背景图' },
        'x-i18n-desc': { 'zh-CN': '菜单界面的背景图片' },
      }),
    buttonHoverSound: z
      .string()
      .optional()
      .describe('Sound effect played when hovering a menu button')
      .meta({
        title: 'Button Hover Sound',
        format: 'asset',
        'x-asset-kind': 'audio',
        'x-i18n': { 'zh-CN': '按钮悬停音效' },
        'x-i18n-desc': { 'zh-CN': '鼠标悬停到菜单按钮时播放的音效' },
      }),
    backButtonSound: z
      .string()
      .optional()
      .describe('Sound effect played when closing the menu')
      .meta({
        title: 'Back Sound',
        format: 'asset',
        'x-asset-kind': 'audio',
        'x-i18n': { 'zh-CN': '返回音效' },
        'x-i18n-desc': { 'zh-CN': '关闭菜单时播放的音效' },
      }),
    startButtonSound: z
      .string()
      .optional()
      .describe('Sound effect played when confirming a menu action')
      .meta({
        title: 'Confirm Sound',
        format: 'asset',
        'x-asset-kind': 'audio',
        'x-i18n': { 'zh-CN': '确认音效' },
        'x-i18n-desc': { 'zh-CN': '确认菜单动作时播放的音效' },
      }),
    buttons: z
      .array(MenuButtonUiSchema)
      .min(1)
      .describe('Menu buttons')
      .meta({
        title: 'Buttons',
        'x-i18n': { 'zh-CN': '按钮列表' },
        'x-i18n-desc': { 'zh-CN': '菜单中的按钮列表' },
      }),
  })
  .describe('Menu overlay UI configuration')
  .meta({
    title: 'Menu Overlay',
    'x-i18n': { 'zh-CN': '菜单界面' },
    'x-i18n-desc': { 'zh-CN': '游戏内菜单的可配置数据' },
  });

const createSaveLoadTextUiSchema = (defaultFontSize: number, defaultColor: string) =>
  z.object({
    enabled: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether to display this text block')
      .meta({
        title: 'Enabled',
        'x-i18n': { 'zh-CN': '启用' },
        'x-i18n-desc': { 'zh-CN': '是否显示该文本块' },
      }),
    position: positionSchema,
    fontSize: z
      .number()
      .optional()
      .default(defaultFontSize)
      .describe('Text font size')
      .meta({
        title: 'Font Size',
        'x-i18n': { 'zh-CN': '字号' },
        'x-i18n-desc': { 'zh-CN': '文本字号' },
      }),
    color: z
      .string()
      .optional()
      .default(defaultColor)
      .describe('Text color')
      .meta({
        title: 'Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '颜色' },
        'x-i18n-desc': { 'zh-CN': '文本颜色' },
      }),
  });

const SaveLoadPageButtonUiSchema = z
  .object({
    position: positionSchema,
    fileNames: buttonSrc,
    text: z
      .string()
      .optional()
      .describe('Optional page button label, defaults to page number')
      .meta({
        title: 'Text',
        'x-i18n': { 'zh-CN': '文字' },
        'x-i18n-desc': { 'zh-CN': '页码按钮的文字，不填时默认显示页码序号' },
      }),
    fontSize: z
      .number()
      .optional()
      .default(36)
      .describe('Page button font size')
      .meta({
        title: 'Font Size',
        'x-i18n': { 'zh-CN': '字号' },
        'x-i18n-desc': { 'zh-CN': '页码按钮文字字号' },
      }),
    activeTextColor: z
      .string()
      .optional()
      .default('#000000')
      .describe('Page button text color when active')
      .meta({
        title: 'Active Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '激活颜色' },
        'x-i18n-desc': { 'zh-CN': '当前页码按钮的文字颜色' },
      }),
    inactiveTextColor: z
      .string()
      .optional()
      .default('#ffffff')
      .describe('Page button text color when inactive')
      .meta({
        title: 'Inactive Color',
        format: 'color',
        'x-i18n': { 'zh-CN': '未激活颜色' },
        'x-i18n-desc': { 'zh-CN': '非当前页码按钮的文字颜色' },
      }),
  })
  .describe('Save/load page button configuration')
  .meta({
    title: 'Page Button',
    'x-i18n': { 'zh-CN': '页码按钮' },
    'x-i18n-desc': { 'zh-CN': '存读档界面的页码按钮配置' },
  });

const SaveLoadSlotButtonUiSchema = z
  .object({
    position: positionSchema,
    fileNames: buttonSrc,
  })
  .describe('Save/load slot button configuration')
  .meta({
    title: 'Slot',
    'x-i18n': { 'zh-CN': '槽位' },
    'x-i18n-desc': { 'zh-CN': '每页复用的存档槽位配置' },
  });

const SaveLoadSlotContentUiSchema = z
  .object({
    snapshot: z
      .object({
        position: positionSchema,
      })
      .describe('Snapshot image layout')
      .meta({
        title: 'Snapshot',
        'x-i18n': { 'zh-CN': '截图' },
        'x-i18n-desc': { 'zh-CN': '存档截图的位置配置' },
      }),
    deleteButton: OverlayIconButtonUiSchema.describe('Delete button configuration').meta({
      title: 'Delete Button',
      'x-i18n': { 'zh-CN': '删除按钮' },
      'x-i18n-desc': { 'zh-CN': '存档槽位删除按钮配置' },
    }),
    name: createSaveLoadTextUiSchema(28, '#ffffff')
      .describe('Save name text configuration')
      .meta({
        title: 'Name',
        'x-i18n': { 'zh-CN': '名称' },
        'x-i18n-desc': { 'zh-CN': '存档名称文本的显示配置' },
      }),
    summary: createSaveLoadTextUiSchema(20, '#ffffff')
      .extend({
        boxWidth: z
          .number()
          .optional()
          .default(442)
          .describe('Summary text box width')
          .meta({
            title: 'Box Width',
            'x-i18n': { 'zh-CN': '文本框宽度' },
            'x-i18n-desc': { 'zh-CN': '摘要文本区域的宽度' },
          }),
        boxHeight: z
          .number()
          .optional()
          .default(52)
          .describe('Summary text box height')
          .meta({
            title: 'Box Height',
            'x-i18n': { 'zh-CN': '文本框高度' },
            'x-i18n-desc': { 'zh-CN': '摘要文本区域的高度' },
          }),
      })
      .describe('Save summary text configuration')
      .meta({
        title: 'Summary',
        'x-i18n': { 'zh-CN': '摘要' },
        'x-i18n-desc': { 'zh-CN': '存档摘要文本的显示配置' },
      }),
    timestamp: createSaveLoadTextUiSchema(16, '#ffffff')
      .describe('Save timestamp text configuration')
      .meta({
        title: 'Timestamp',
        'x-i18n': { 'zh-CN': '时间戳' },
        'x-i18n-desc': { 'zh-CN': '存档时间文本的显示配置' },
      }),
    emptyText: createSaveLoadTextUiSchema(32, '#ffffff')
      .extend({
        text: z
          .string()
          .optional()
          .default('NO DATA')
          .describe('Placeholder text for empty slots')
          .meta({
            title: 'Text',
            'x-i18n': { 'zh-CN': '文字' },
            'x-i18n-desc': { 'zh-CN': '空存档槽位显示的文案' },
          }),
        opacity: z
          .number()
          .optional()
          .default(0.6)
          .describe('Placeholder text opacity')
          .meta({
            title: 'Opacity',
            'x-i18n': { 'zh-CN': '透明度' },
            'x-i18n-desc': { 'zh-CN': '空存档槽位文案的透明度' },
          }),
      })
      .describe('Empty slot placeholder configuration')
      .meta({
        title: 'Empty Text',
        'x-i18n': { 'zh-CN': '空槽文案' },
        'x-i18n-desc': { 'zh-CN': '空存档槽位文案的显示配置' },
      }),
  })
  .describe('Save/load slot content layout configuration')
  .meta({
    title: 'Slot Content',
    'x-i18n': { 'zh-CN': '槽位内容' },
    'x-i18n-desc': { 'zh-CN': '存档槽位内部内容的布局与显示配置' },
  });

export const SaveLoadUiSchema = z
  .object({
    defaultType: z
      .enum(['save', 'load'])
      .optional()
      .default('load')
      .describe('Default save/load mode when no overlay params are provided')
      .meta({
        title: 'Default Type',
        'x-i18n': { 'zh-CN': '默认模式' },
        'x-i18n-desc': { 'zh-CN': '未提供 overlay 参数时，存读档界面默认展示的模式' },
      }),
    mask: z
      .string()
      .describe('Save/load overlay mask image')
      .meta({
        title: 'Mask',
        format: 'asset',
        'x-asset-kind': 'image',
        'x-i18n': { 'zh-CN': '遮罩图' },
        'x-i18n-desc': { 'zh-CN': '存读档界面的遮罩图片' },
      }),
    background: z
      .string()
      .describe('Save/load overlay background image')
      .meta({
        title: 'Background',
        format: 'asset',
        'x-asset-kind': 'image',
        'x-i18n': { 'zh-CN': '背景图' },
        'x-i18n-desc': { 'zh-CN': '存读档界面的背景图片' },
      }),
    hoverButtonSound: z
      .string()
      .optional()
      .describe('Sound effect played when hovering save/load buttons')
      .meta({
        title: 'Button Hover Sound',
        format: 'asset',
        'x-asset-kind': 'audio',
        'x-i18n': { 'zh-CN': '按钮悬停音效' },
        'x-i18n-desc': { 'zh-CN': '鼠标悬停到存读档按钮时播放的音效' },
      }),
    backButtonSound: z
      .string()
      .optional()
      .describe('Sound effect played when closing the save/load overlay')
      .meta({
        title: 'Back Sound',
        format: 'asset',
        'x-asset-kind': 'audio',
        'x-i18n': { 'zh-CN': '返回音效' },
        'x-i18n-desc': { 'zh-CN': '关闭存读档界面时播放的音效' },
      }),
    enableAutoSaveSlot: z
      .boolean()
      .optional()
      .default(true)
      .describe('Whether the first slot on the first page maps to auto-save')
      .meta({
        title: 'Enable Auto-Save Slot',
        'x-i18n': { 'zh-CN': '启用 auto-save 槽位' },
        'x-i18n-desc': { 'zh-CN': '启用后第一页第一个槽位映射到 auto-save，否则不展示 auto-save 槽位' },
      }),
    title: z
      .object({
        position: positionSchema,
        saveText: z
          .string()
          .optional()
          .default('SAVE')
          .describe('Title text in save mode')
          .meta({
            title: 'Save Text',
            'x-i18n': { 'zh-CN': '保存标题' },
            'x-i18n-desc': { 'zh-CN': '保存模式下显示的标题文字' },
          }),
        loadText: z
          .string()
          .optional()
          .default('LOAD')
          .describe('Title text in load mode')
          .meta({
            title: 'Load Text',
            'x-i18n': { 'zh-CN': '读取标题' },
            'x-i18n-desc': { 'zh-CN': '读取模式下显示的标题文字' },
          }),
        fontSize: z
          .number()
          .optional()
          .default(48)
          .describe('Title font size')
          .meta({
            title: 'Font Size',
            'x-i18n': { 'zh-CN': '字号' },
            'x-i18n-desc': { 'zh-CN': '存读档标题文字字号' },
          }),
        color: z
          .string()
          .optional()
          .default('#ffffff')
          .describe('Title text color')
          .meta({
            title: 'Color',
            format: 'color',
            'x-i18n': { 'zh-CN': '颜色' },
            'x-i18n-desc': { 'zh-CN': '存读档标题文字颜色' },
          }),
      })
      .describe('Save/load title configuration')
      .meta({
        title: 'Title',
        'x-i18n': { 'zh-CN': '标题' },
        'x-i18n-desc': { 'zh-CN': '存读档界面的标题配置' },
      }),
    closeButton: OverlayIconButtonUiSchema.describe('Close button configuration').meta({
      title: 'Close Button',
      'x-i18n': { 'zh-CN': '关闭按钮' },
      'x-i18n-desc': { 'zh-CN': '存读档界面的关闭按钮配置' },
    }),
    pageButtons: z
      .array(SaveLoadPageButtonUiSchema)
      .min(1)
      .describe('Page button configurations')
      .meta({
        title: 'Page Buttons',
        'x-i18n': { 'zh-CN': '页码按钮' },
        'x-i18n-desc': { 'zh-CN': '存读档界面的页码按钮配置' },
      }),
    slots: z
      .array(SaveLoadSlotButtonUiSchema)
      .min(1)
      .describe('Per-page slot button configurations')
      .meta({
        title: 'Slots',
        'x-i18n': { 'zh-CN': '槽位列表' },
        'x-i18n-desc': { 'zh-CN': '每页复用的存档槽位列表' },
      }),
    slotContent: SaveLoadSlotContentUiSchema,
  })
  .describe('Save/load overlay UI configuration')
  .meta({
    title: 'Save/Load Overlay',
    'x-i18n': { 'zh-CN': '存读档界面' },
    'x-i18n-desc': { 'zh-CN': '存读档浮层的可配置数据' },
  });

export const ConfirmUiSchema = z
  .object({
    defaultMessage: z
      .string()
      .optional()
      .default('Preview')
      .describe('Default dialog message when no overlay params are provided')
      .meta({
        title: 'Default Message',
        'x-i18n': { 'zh-CN': '默认消息' },
        'x-i18n-desc': { 'zh-CN': '未提供 overlay 参数时，确认对话框默认显示的消息文本' },
      }),
    defaultMode: z
      .enum(['alert', 'confirm'])
      .optional()
      .default('confirm')
      .describe('Default dialog mode when no overlay params are provided')
      .meta({
        title: 'Default Mode',
        'x-i18n': { 'zh-CN': '默认模式' },
        'x-i18n-desc': { 'zh-CN': '未提供 overlay 参数时，确认对话框默认使用的模式' },
      }),
    mask: z
      .string()
      .describe('Confirm overlay mask image')
      .meta({
        title: 'Mask',
        format: 'asset',
        'x-asset-kind': 'image',
        'x-i18n': { 'zh-CN': '遮罩图' },
        'x-i18n-desc': { 'zh-CN': '确认对话框的遮罩图片' },
      }),
    background: z
      .string()
      .describe('Confirm dialog background image')
      .meta({
        title: 'Background',
        format: 'asset',
        'x-asset-kind': 'image',
        'x-i18n': { 'zh-CN': '背景图' },
        'x-i18n-desc': { 'zh-CN': '确认对话框的背景图片' },
      }),
    confirmButtonSound: z
      .string()
      .optional()
      .describe('Sound effect played when confirming the dialog')
      .meta({
        title: 'Confirm Sound',
        format: 'asset',
        'x-asset-kind': 'audio',
        'x-i18n': { 'zh-CN': '确认音效' },
        'x-i18n-desc': { 'zh-CN': '点击确认按钮时播放的音效' },
      }),
    cancelButtonSound: z
      .string()
      .optional()
      .describe('Sound effect played when cancelling the dialog')
      .meta({
        title: 'Cancel Sound',
        format: 'asset',
        'x-asset-kind': 'audio',
        'x-i18n': { 'zh-CN': '取消音效' },
        'x-i18n-desc': { 'zh-CN': '点击取消按钮时播放的音效' },
      }),
    message: z
      .object({
        position: positionSchema,
        fontSize: z
          .number()
          .optional()
          .default(36)
          .describe('Dialog message font size')
          .meta({
            title: 'Font Size',
            'x-i18n': { 'zh-CN': '字号' },
            'x-i18n-desc': { 'zh-CN': '对话框消息文字字号' },
          }),
        color: z
          .string()
          .optional()
          .default('#ffffff')
          .describe('Dialog message text color')
          .meta({
            title: 'Color',
            format: 'color',
            'x-i18n': { 'zh-CN': '颜色' },
            'x-i18n-desc': { 'zh-CN': '对话框消息文字颜色' },
          }),
      })
      .describe('Dialog message configuration')
      .meta({
        title: 'Message',
        'x-i18n': { 'zh-CN': '消息文本' },
        'x-i18n-desc': { 'zh-CN': '确认对话框消息文本的显示配置' },
      }),
    alertButton: OverlayTextButtonUiSchema.describe('Alert mode button configuration').meta({
      title: 'Alert Button',
      'x-i18n': { 'zh-CN': '提示按钮' },
      'x-i18n-desc': { 'zh-CN': 'alert 模式下的按钮配置' },
    }),
    confirmButton: OverlayTextButtonUiSchema.describe('Confirm mode accept button configuration').meta({
      title: 'Confirm Button',
      'x-i18n': { 'zh-CN': '确认按钮' },
      'x-i18n-desc': { 'zh-CN': 'confirm 模式下的确认按钮配置' },
    }),
    cancelButton: OverlayTextButtonUiSchema.describe('Confirm mode cancel button configuration').meta({
      title: 'Cancel Button',
      'x-i18n': { 'zh-CN': '取消按钮' },
      'x-i18n-desc': { 'zh-CN': 'confirm 模式下的取消按钮配置' },
    }),
  })
  .describe('Confirm dialog overlay UI configuration')
  .meta({
    title: 'Confirm Dialog',
    'x-i18n': { 'zh-CN': '确认对话框' },
    'x-i18n-desc': { 'zh-CN': '确认对话框浮层的可配置数据' },
  });

export const StageTextBoxUiSchema = z
  .object({
    background: TextboxImageUiSchema,
    content: z
      .object({
        position: positionSchema,
        boxWidth,
        boxHeight,
        printMode: printModeUiSchema,
        printSpeed: printSpeedUiSchema,
        textStyle: TextStyleUiSchema,
      })
      .describe('Text content layout')
      .meta({
        title: 'Content',
        'x-i18n': { 'zh-CN': '正文区域' },
        'x-i18n-desc': { 'zh-CN': '文本框正文的位置与尺寸' },
      }),
    nameBox: z
      .object({
        background: TextboxImageUiSchema,
        text: z
          .object({
            position: positionSchema,
            anchor: anchorSchema.optional().default([0.5, 0.5]),
            pivot: pivotSchema.optional().default([0.5, 0.5]),
            textStyle: TextStyleUiSchema,
          })
          .describe('Name text layout and style')
          .meta({
            title: 'Name Text',
            'x-i18n': { 'zh-CN': '姓名文字' },
            'x-i18n-desc': { 'zh-CN': '姓名框内文字的位置与样式配置' },
          }),
      })
      .describe('Name box layout')
      .meta({
        title: 'Name Box',
        'x-i18n': { 'zh-CN': '姓名框' },
        'x-i18n-desc': { 'zh-CN': '姓名框背景与姓名文字的配置' },
      }),
    avatar: z
      .object({
        position: positionSchema,
        anchor: anchorSchema.optional().default([0, 0]),
        pivot: pivotSchema,
      })
      .describe('Default textbox avatar layout')
      .meta({
        title: 'Avatar',
        'x-i18n': { 'zh-CN': '头像' },
        'x-i18n-desc': { 'zh-CN': '文本框头像的默认位置与锚点；命令中的 offset 会相对此位置生效' },
      }),
    controls: z
      .object({
        closeButton: z
          .object({
            position: positionSchema,
            fileNames: buttonSrc,
            anchor: anchorSchema.optional(),
            pivot: pivotSchema.optional(),
          })
          .describe('Close button configuration')
          .meta({
            title: 'Close Button',
            'x-i18n': { 'zh-CN': '关闭按钮' },
            'x-i18n-desc': { 'zh-CN': '文本框右上角关闭按钮配置' },
          }),
        buttons: z
          .array(TextBoxActionButtonUiSchema)
          .describe('Textbox action buttons')
          .meta({
            title: 'Buttons',
            'x-i18n': { 'zh-CN': '按钮列表' },
            'x-i18n-desc': { 'zh-CN': '文本框功能按钮列表' },
          }),
        cursor: z
          .object({
            enabled: z
              .boolean()
              .optional()
              .default(true)
              .describe('Whether to show the textbox cursor')
              .meta({
                title: 'Enabled',
                'x-i18n': { 'zh-CN': '启用' },
                'x-i18n-desc': { 'zh-CN': '是否显示文本框光标' },
              }),
            src: z
              .string()
              .describe('Cursor asset path')
              .meta({
                title: 'Cursor',
                format: 'asset',
                'x-asset-kind': 'image',
                'x-i18n': { 'zh-CN': '光标素材' },
                'x-i18n-desc': { 'zh-CN': '文本框光标使用的素材路径' },
              }),
            tint: z
              .string()
              .optional()
              .default('#999999')
              .describe('Cursor tint color')
              .meta({
                title: 'Tint',
                format: 'color',
                'x-i18n': { 'zh-CN': '着色' },
                'x-i18n-desc': { 'zh-CN': '文本框光标的着色颜色' },
              }),
            offsetX: z
              .number()
              .optional()
              .default(8)
              .describe('Cursor horizontal offset relative to the reported text cursor position')
              .meta({
                title: 'Offset X',
                'x-i18n': { 'zh-CN': '偏移 X' },
                'x-i18n-desc': { 'zh-CN': '相对于文字光标位置的水平偏移' },
              }),
            offsetY: z
              .number()
              .optional()
              .default(10)
              .describe('Cursor vertical offset relative to the reported text cursor position')
              .meta({
                title: 'Offset Y',
                'x-i18n': { 'zh-CN': '偏移 Y' },
                'x-i18n-desc': { 'zh-CN': '相对于文字光标位置的垂直偏移' },
              }),
          })
          .describe('Textbox cursor configuration')
          .meta({
            title: 'Cursor',
            'x-i18n': { 'zh-CN': '光标' },
            'x-i18n-desc': { 'zh-CN': '文本框打字光标的显示配置' },
          }),
        hover: z
          .object({
            showOnHover: z
              .boolean()
              .optional()
              .default(true)
              .describe('Whether to show buttons only when hovering the textbox')
              .meta({
                title: 'Show On Hover',
                'x-i18n': { 'zh-CN': '悬停显示' },
                'x-i18n-desc': { 'zh-CN': '是否仅在鼠标悬停文本框时显示按钮' },
              }),
            visibilityDelayMs: z
              .number()
              .optional()
              .default(80)
              .describe('Delay before the button group starts fading in')
              .meta({
                title: 'Visibility Delay',
                'x-i18n': { 'zh-CN': '显示延迟' },
                'x-i18n-desc': { 'zh-CN': '按钮组开始淡入前的延迟时间（毫秒）' },
              }),
            fadeDurationMs: z
              .number()
              .optional()
              .default(140)
              .describe('Fade duration for the button group')
              .meta({
                title: 'Fade Duration',
                'x-i18n': { 'zh-CN': '淡入淡出时长' },
                'x-i18n-desc': { 'zh-CN': '按钮组淡入淡出的持续时间（毫秒）' },
              }),
          })
          .describe('Textbox hover behavior')
          .meta({
            title: 'Hover',
            'x-i18n': { 'zh-CN': '悬停行为' },
            'x-i18n-desc': { 'zh-CN': '文本框按钮在悬停时的显示行为配置' },
          }),
      })
      .describe('Textbox controls configuration')
      .meta({
        title: 'Controls',
        'x-i18n': { 'zh-CN': '控件' },
        'x-i18n-desc': { 'zh-CN': '文本框按钮、光标与悬停行为配置' },
      }),
  })
  .describe('Stage textbox UI configuration')
  .meta({
    title: 'Textbox',
    'x-i18n': { 'zh-CN': '文本框' },
    'x-i18n-desc': { 'zh-CN': '舞台文本框、正文、姓名框与头像的布局配置' },
  });

export const StageUiSchema = z
  .object({
    textbox: StageTextBoxUiSchema,
  })
  .describe('Stage UI configuration')
  .meta({
    title: 'Stage',
    'x-i18n': { 'zh-CN': '舞台' },
    'x-i18n-desc': { 'zh-CN': '舞台界面的可配置数据' },
  });

export const GameUiSchema = z.object({
  stage: StageUiSchema,
  title: TitleUiSchema,
  menu: MenuUiSchema,
  saveload: SaveLoadUiSchema,
  confirm: ConfirmUiSchema,
});

export type TitleButtonAction = z.infer<typeof TitleButtonActionUiSchema>;
export type TitleButtonUiData = z.infer<typeof TitleButtonUiSchema>;
export type TitleUiData = z.infer<typeof TitleUiSchema>;
export type MenuButtonAction = z.infer<typeof MenuButtonActionUiSchema>;
export type MenuButtonUiData = z.infer<typeof MenuButtonUiSchema>;
export type MenuUiData = z.infer<typeof MenuUiSchema>;
export type SaveLoadUiData = z.infer<typeof SaveLoadUiSchema>;
export type ConfirmUiData = z.infer<typeof ConfirmUiSchema>;
export type TextStyleUiData = z.infer<typeof TextStyleUiSchema>;
export type StageTextBoxUiData = z.infer<typeof StageTextBoxUiSchema>;
export type StageUiData = z.infer<typeof StageUiSchema>;
export type GameUiData = z.infer<typeof GameUiSchema>;

declare module '@momoyu-ink/kit' {
  interface RootUiDataMap extends GameUiData {}
}
