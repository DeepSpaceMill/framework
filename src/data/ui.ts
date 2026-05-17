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

export const GameUiSchema = z.object({
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
export type GameUiData = z.infer<typeof GameUiSchema>;

declare module '@momoyu-ink/kit' {
  interface RootUiDataMap extends GameUiData {}
}
