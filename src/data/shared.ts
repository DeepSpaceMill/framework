import z from 'zod';

export const normalizedNumberSchema = z.number().min(0).max(1).default(0).meta({
  'x-step': 0.01,
});
export const normalizedNumberOneSchema = z.number().min(0).max(1).default(1).meta({
  'x-step': 0.01,
});

export const tuplePointSchema = z.tuple([normalizedNumberSchema, normalizedNumberSchema]).meta({
  format: 'point',
});

export const tupleBoundsSchema = z
  .tuple([normalizedNumberSchema, normalizedNumberSchema, normalizedNumberSchema, normalizedNumberSchema])
  .meta({
    format: 'bounds',
  });

export const timeMillisSchema = z.number().min(0).multipleOf(1).default(0).meta({
  'x-step': 50,
});

export const posXSchema = z.number().meta({
  title: 'X',
  'x-i18n': { 'zh-CN': 'X 坐标' },
});

export const posYSchema = z.number().meta({
  title: 'Y',
  'x-i18n': { 'zh-CN': 'Y 坐标' },
});

export const positionSchema = z
  .object({
    x: posXSchema,
    y: posYSchema,
  })
  .meta({
    title: 'Coordinates',
    'x-i18n': { 'zh-CN': '坐标' },
    format: 'position',
  });

export const boxWidthSchema = z
  .number()
  .min(0)
  .describe('Text box width in pixels')
  .meta({
    title: 'Box Width',
    'x-i18n': { 'zh-CN': '文本框宽度' },
    'x-i18n-desc': { 'zh-CN': '文本区域宽度（像素）' },
  });

export const boxHeightSchema = z
  .number()
  .min(0)
  .describe('Text box height in pixels')
  .meta({
    title: 'Box Height',
    'x-i18n': { 'zh-CN': '文本框高度' },
    'x-i18n-desc': { 'zh-CN': '文本区域高度（像素）' },
  });

export const pivotSchema = tuplePointSchema.describe('Pivot point (x, y)').meta({
  title: 'Pivot',
  'x-i18n': { 'zh-CN': '旋转中心' },
  'x-i18n-desc': { 'zh-CN': '节点旋转和定位的锚点' },
});

export const anchorSchema = tuplePointSchema.describe('Anchor point (x, y)').meta({
  title: 'Anchor',
  'x-i18n': { 'zh-CN': '锚点' },
  'x-i18n-desc': { 'zh-CN': '节点对齐使用的锚点' },
});

export const textStyleSchema = z
  .object({
    fontSize: z
      .number()
      .nonnegative()
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
      .nonnegative()
      .optional()
      .default(1.5)
      .describe('Line height multiplier')
      .meta({
        title: 'Line Height',
        'x-step': 0.1,
        'x-i18n': { 'zh-CN': '行高' },
        'x-i18n-desc': { 'zh-CN': '行高倍数' },
      }),
    indent: z
      .number()
      .nonnegative()
      .optional()
      .default(0)
      .describe('First-line indentation in pixels')
      .meta({
        title: 'Indent',
        'x-step': 0.1,
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
      .nonnegative()
      .optional()
      .default(2)
      .describe('Stroke width in pixels')
      .meta({
        title: 'Stroke Width',
        'x-step': 0.01,
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
        'x-step': 0.01,
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
        'x-step': 0.01,
        'x-i18n': { 'zh-CN': '阴影偏移 Y' },
        'x-i18n-desc': { 'zh-CN': '阴影 Y 轴偏移（像素）' },
      }),
    shadowBlur: z
      .number()
      .nonnegative()
      .optional()
      .default(0)
      .describe('Shadow blur radius in pixels')
      .meta({
        title: 'Shadow Blur',
        'x-step': 0.01,
        'x-i18n': { 'zh-CN': '阴影模糊' },
        'x-i18n-desc': { 'zh-CN': '阴影模糊半径（像素）' },
      }),
    shadowWidth: z
      .number()
      .nonnegative()
      .optional()
      .default(0)
      .describe('Shadow width in pixels, only effective when shadow is enabled')
      .meta({
        title: 'Shadow Width',
        'x-step': 0.01,
        'x-i18n': { 'zh-CN': '阴影宽度' },
        'x-i18n-desc': { 'zh-CN': '阴影宽度（像素），仅在启用阴影时生效' },
      }),
  })
  .describe('Text style configuration')
  .meta({
    title: 'Text Style',
    format: 'text-style',
    'x-i18n': { 'zh-CN': '文字样式' },
    'x-i18n-desc': { 'zh-CN': '文本渲染使用的样式配置' },
  });

export const printModeSchema = z
  .enum(['instant', 'typewriter', 'printer'])
  .optional()
  .default('typewriter')
  .describe('Default text printing mode')
  .meta({
    title: 'Print Mode',
    'x-i18n': { 'zh-CN': '打字模式' },
    'x-i18n-desc': { 'zh-CN': '正文默认的文字打印模式' },
  });

export const printSpeedSchema = z
  .number()
  .nonnegative()
  .optional()
  .default(20)
  .describe('Default print speed: chars/sec (typewriter) or lines/sec (printer)')
  .meta({
    title: 'Print Speed',
    'x-step': 0.1,
    'x-i18n': { 'zh-CN': '打字速度' },
    'x-i18n-desc': { 'zh-CN': '正文默认的打印速度；逐字模式为字/秒，打印机模式为行/秒' },
  });

export const ninesliceBoundsSchema = tupleBoundsSchema.describe('Nine-slice bounds [left, top, right, bottom]').meta({
  title: 'Bounds',
  'x-i18n': { 'zh-CN': '九宫格边界' },
  'x-i18n-desc': { 'zh-CN': '九宫格缩放使用的边界 [left, top, right, bottom]' },
});

export const buttonIdleSchema = z
  .string()
  .describe('Idle state image')
  .meta({
    title: 'Idle',
    format: 'asset',
    'x-asset-kind': 'image',
    'x-i18n': { 'zh-CN': '空闲' },
    'x-i18n-desc': { 'zh-CN': '按钮空闲状态的图片' },
  });

export const buttonHoverSchema = z
  .string()
  .describe('Hover state image')
  .meta({
    title: 'Hover',
    format: 'asset',
    'x-asset-kind': 'image',
    'x-i18n': { 'zh-CN': '悬停' },
    'x-i18n-desc': { 'zh-CN': '按钮悬停状态的图片' },
  });

export const buttonPressedSchema = z
  .string()
  .describe('Pressed state image')
  .meta({
    title: 'Pressed',
    format: 'asset',
    'x-asset-kind': 'image',
    'x-i18n': { 'zh-CN': '按下' },
    'x-i18n-desc': { 'zh-CN': '按钮按下状态的图片' },
  });

export const buttonSchema = z
  .tuple([buttonIdleSchema, buttonHoverSchema, buttonPressedSchema])
  .describe('Button images in idle, hover, and pressed states')
  .meta({
    title: 'Button Images',
    'x-i18n': { 'zh-CN': '按钮图片' },
    'x-i18n-desc': { 'zh-CN': '按钮空闲、悬停和按下状态的图片' },
  });
