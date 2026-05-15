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

export const TitleButtonUiSchema = z
  .object({
    x: posX,
    y: posY,
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

export const GameUiSchema = z.object({
  title: TitleUiSchema,
});

export type TitleButtonAction = z.infer<typeof TitleButtonActionUiSchema>;
export type TitleButtonUiData = z.infer<typeof TitleButtonUiSchema>;
export type TitleUiData = z.infer<typeof TitleUiSchema>;
export type GameUiData = z.infer<typeof GameUiSchema>;

declare module '@momoyu-ink/kit' {
  interface RootUiDataMap extends GameUiData {}
}
