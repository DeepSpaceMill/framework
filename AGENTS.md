# Moyu Visual Novel Framework — Agent 指南

本文档面向 AI coding agent 和开发者，修改或定制 **末语（Moyu）视觉小说框架** 前务必阅读。

## 本项目是什么

基于 **末语（Moyu）** 引擎的 TypeScript + React 视觉小说框架。运行于 native（Windows / macOS / Linux / Android / iOS，通过 QuickJS）与 web（WebAssembly）两种平台。

- **渲染器**：`@momoyu-ink/kit` 的自定义 React reconciler（**不是 react-dom**）
- **JSX 元素**：`<container>` / `<sprite>` / `<text>` / `<video>` 等 Moyu intrinsic elements（**不支持 HTML 元素**）
- **状态管理**：Valtio proxy
- **动画**：react-spring（通过 `@momoyu-ink/kit` 重导出）
- **Schema**：Zod（命令定义 + `commands.schema.json` 生成）

> SDK 细节见 `@momoyu-ink/kit` 的 `AGENTS.md`。

---

## 关键约束

1. **不支持 HTML 元素**：写 `<div>` / `<span>` 会崩。JSX 元素必须是 kit 暴露的 intrinsic element。
2. **不支持 react-dom**：入口用 kit 的 `createRoot()`。
3. **优先复用 kit**：导航 / 事件 / 音频 / 动画 / stage 管理都在 kit 里。新增抽象前先查 kit。
4. **资源路径相对 `assets/`**：`<sprite src="image.png" />` 指 `assets/image.png`。

---

## 项目结构

```
src/
├── index.tsx          # 入口：ready 事件 → createRoot → <Main>
├── router.ts          # createStackNavigator：pages + overlays，含类型注册
├── error.tsx          # 全局 ErrorBoundary fallback
├── actors/            # Stage 下的 actor（可视 + headless）
│   ├── background.tsx # 背景 + fade transition + tint spring
│   ├── character.tsx  # 立绘（position / scale / tint / fade 动画）
│   ├── textbox.tsx    # 文本框 + typewriter + 功能按钮
│   ├── selection.tsx  # 选项菜单（期间用 skip/auto blocker 阻断）
│   ├── bgm.tsx        # BGM（headless）
│   ├── voice.tsx      # 语音（headless，参与 auto ticket）
│   ├── sfx.tsx        # 一次性音效（headless；skip 期间丢弃）
│   └── sound.tsx      # 命名声道音效（headless）
├── commands/
│   ├── commands.ts    # Zod schema（含 x-i18n / x-asset-kind / format 等 meta）
│   └── handlers.ts    # 命令响应层：更新框架状态与流程控制，让 Stage / actor 执行效果
├── components/        # UI 组件：button / dialog / checkbox / slider / select / frame / notification
├── hooks/
│   ├── useBacklog.ts  # Backlog 滚动 + 滚动条
│   ├── useButton.ts   # 按钮状态机（idle / hover / press）
│   └── useSaveLoad.ts # 存读档槽位管理
├── pages/
│   ├── title.tsx      # 标题画面
│   ├── stage.tsx      # 游戏主舞台：注册命令 + 装配 actor
│   └── menu.tsx / settings.tsx / saveload.tsx / backlog.tsx  # overlay 页
├── state/
│   ├── game.ts        # GameState（valtio proxy）+ resetGameState()
│   ├── ui.ts          # UIState：通知队列、confirm 弹窗入口
│   └── settings.ts    # 设置（持久化到 scenario permanent variable）
└── utils/
    ├── mergeEvent.ts
    └── scenarioGameState.ts  # gameState ⇌ scenario variable 序列化/恢复
```

---

## 架构

### App 生命周期

```
引擎发 'ready' 事件
  → index.tsx 调 createRoot().render(<Main>)
    → ErrorBoundary 包 <Navigation /> + <Notification />
      → router.ts 的 createStackNavigator（initialPage: 'title'）
        → Title 页
```

`index.tsx` 同时在 `beforeunload` 上挂了退出确认，会调 `system.quit`。

### Stage 两层架构

Stage 是剧情驱动 UI 的核心页面，采用严格的双层设计：

- **Layer 1 — Command handler**（`commands/handlers.ts`）：负责响应 scenario 命令，更新框架状态与流程控制，让 Stage / actor 执行出对应效果。当前 handler 主要改 `gameState`、调用 `control.setWaiting()` / `control.hold()` / `control.record()`，并在少量需要与 backlog / 存档保持一致的路径上先同步 scenario 变量快照。
- **Layer 2 — Actor**（`actors/*.tsx`）：React 组件，`useSnapshot` 订阅 `gameState`，承担副作用（音频、动画、节点命令、auto ticket）。

换句话说，handler 负责描述“命令发生后，框架状态应该变成什么、流程应该停在哪里”；actor 负责把这些状态变化落实成真实的视觉、音频和引擎行为。

**Stage 单例跨 HMR 保活**：`pages/stage.tsx` 把 stage 实例挂到 `globalThis.__MOYU_FRAMEWORK_STAGE__`，防止 Fast Refresh 重建 stage 后 scenario 事件监听错乱或 runtime 状态丢失：

```typescript
// pages/stage.tsx
function getStageSingleton(): StageInstance {
  const g = globalThis as StageGlobal;
  g.__MOYU_FRAMEWORK_STAGE__ ??= createStage();
  return g.__MOYU_FRAMEWORK_STAGE__;
}

const stage = getStageSingleton();

export function Stage() {
  const params = useNavigationParams<StageParams>();
  const stories = useMemo(() => [params.story], [params.story]);

  useEffect(() => {
    const unregs = registerStageHandlers(stage);
    return () => unregs.forEach((fn) => fn());
  }, []);

  useScenario(stories, params.story, params.entry, params.isNewGame);

  return (
    <StageContextProvider stage={stage}>
      <BackgroundActor />
      <CharacterActor />
      <TextBoxActor onButtonClick={/* ... */} />
      <SelectionActor />
      <BGMActor />
      <VoiceActor />
      <SfxActor />
      <SoundActor />
    </StageContextProvider>
  );
}
```

Stage 同时处理顶层输入：

- 点击 / 触摸结束时，若 overlay 可见或选项菜单可见，则不推进剧情。
- 若 textbox 当前不可见，则本次点击会先重新显示 textbox，并消费掉这次输入，不会继续推进剧情。
- 在可推进状态下，Stage 会先让 `tryInterrupt()` 消费输入（例如完成打字机）；只有没有 interrupt callback 接管时才会 `nextLine()`。
- `mousedown` / `touchstart` 会停止 skip；窗口失焦会同时停止 auto 和 skip。
- 在 stage 页面且没有 overlay 时，滚轮向下会停止 auto 并打开 backlog overlay。

### 流程控制（GameControl）

Handler 收到的 `control` 对象：

| 方法 | 作用 |
|------|------|
| `control.hold()` | 暂停直到用户点击 / 按键；若在 skip 中且当前 dispatch `unskippable()` 则会停止 skip |
| `control.setWaiting(ms, skippable)` | 定时等待，到期或可跳过时由用户 / skip 触发推进 |
| `control.nextLine()` | 立即推进（少用） |
| `control.unskippable()` | 标记本次 dispatch 不可跳过 |
| `control.record(meta)` | 写入 backlog 历史，返回 id |

**默认行为**（handler 不调任何 control 方法）：自动推进到下一行。

### 状态管理

**`gameState`**（`state/game.ts`，valtio proxy）—— 剧情可见、会被序列化到存档的状态：

```typescript
gameState.story       // { title }
gameState.background  // { src, fadeTime, tint?, skippable }
gameState.character   // { presets, characters[], currentSpeaker?, autoTintEnabled, autoTint }
gameState.textbox     // { name, text, visible, printMode, printSpeed, fillColor, ... stroke/shadow 配置 }
gameState.bgm         // { src, loop, volume?, fadeTime? }
gameState.voice       // { src, channelName, volume? }
gameState.sfx         // { seq, src, loop, volume?, fadeTime?, stopSeq, stopFadeTime? }
gameState.sound       // { seq, channel, src, loop, ..., stopSeq, stopChannel, stopFadeTime? }
gameState.selection   // { visible, options[], saveTo? }
```

- 读：actor / component 里走 `useSnapshot(gameState.xxx)`；不要在 render 路径中直接读 proxy。
- 写：handler 直接改 proxy：`gameState.textbox.text = '...'`。
- **存档流程**（`utils/scenarioGameState.ts`）：`writeCurrentGameStateToScenario()` 把当前 snapshot 写入 scenario 变量 `gameState`；`restoreGameStateFromScenario()` 恢复后会把 `sfx.seq` / `sfx.stopSeq` / `sound.seq` / `sound.stopSeq` 归零、并清空 `voice.src`，防止 actor 把恢复值当作新播放 / 停止请求而重放旧音频。

**`uiState`**（`state/ui.ts`）：通知队列 + `uiActions.notify()` / `uiActions.confirm()` / `uiActions.takeSnapshot()` 等辅助函数。`confirm` 通过 overlay navigator 的 `confirm` overlay 实现。

**`settingsState`**（`state/settings.ts`）：音量、文字速度、auto 间隔、skip 配置等。启动时从 scenario permanent variable `settings` 载入（兼容历史 Map 结构），首次为空会写入默认值。任何变更 debounce 300ms 回写。`auto_interval`（秒）会通过 `setDefaultAutoTailMs(auto_interval * 1000)` 同步给 kit 的 auto barrier。

**存档 / 读档 / Backlog 数据流**：框架同时维护引擎存档与 `gameState` 镜像，两者需要显式同步。

- 存档前，`useSaveLoad.saveToSlot()` 会先调用 `writeCurrentGameStateToScenario()`，把当前 `gameState` snapshot 写入 scenario 变量 `gameState`，再调用引擎 `saveGame`。
- 读档后，`useSaveLoad.loadFromSlot()` 会先调用引擎 `loadGame`，再执行 `restoreGameStateFromScenario()` 把框架状态恢复回来。
- backlog 跳转成功后，`useBacklog.jumpToRecord()` 也会调用 `restoreGameStateFromScenario()`，确保 UI 状态与 runtime snapshot 对齐。
- `restoreGameStateFromScenario()` 会额外重置 `sfx` / `sound` 的 seq 触发器并清空 `voice.src`，避免恢复快照时把旧音频误当成新的播放请求。

**音频 actor 的 seq 模式**：`SfxActor` / `SoundActor` 不使用队列，而是 `seq` / `stopSeq` 计数器的变更检测 —— handler 每次播放 / 停止都自增 seq，actor 的 effect 以 seq 为依赖。SFX 在 skip 模式下直接丢弃（通过 `isSkippingRef` 防止 skip 结束后重放被抑制的请求）。两者都不发放 auto ticket，auto 模式不会等 sfx / sound 播完。

---

## 常见定制任务

### 新增一个命令

1. 在 `commands/commands.ts` 定义 Zod schema：

   ```typescript
   const MyCommandSchema = z
     .object({
       command: z.literal('myCommand'),
       param1: z.string(),
       param2: z.number().optional(),
     })
     .describe('What this command does');
   ```

   并把它加入 `ScenarioCommandSchema` 的 union。涉及国际化 / 资源选择 / 颜色的字段加 `.meta({ title, format, 'x-asset-kind', 'x-i18n', 'x-i18n-desc' })` —— 这些元信息会直通 `commands.schema.json`，被外部编辑器（如 fishflow）消费。

2. 在 `commands/handlers.ts` 写 handler（负责根据命令更新框架状态与流程控制）：

   ```typescript
   export const handleMyCommand: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
     if (cmd.command !== 'myCommand') return;
     gameState.someField = cmd.param1;
     // control.hold() / control.setWaiting(ms, skippable) / 或什么都不调（自动推进）
   };
   ```

3. 在 `pages/stage.tsx` 的 `registerStageHandlers` 里注册：

   ```typescript
   stage.registerCommand('myCommand', handleMyCommand),
   ```

4. 运行 `yarn generate:schema` 刷新 `commands.schema.json`。

### Timed command（带过渡时长的命令）约定

涉及 `fadeTime` 的命令遵循统一约定，以便流程控制与 actor 行为一致：

- **固定三参数**：`fadeTime` + `skippable` + `noWait`，均通过 Zod `.optional().default(...)` 给默认值，handler 拿到的总是具体值。
- **每次都重写 state**：handler 里每次把 `fadeTime`（给 actor 用）写入对应 state，**不要**沿用前一次命令的残留，避免 state 泄漏。
- **`noWait` 控制流程**：`!cmd.noWait` ⇒ handler 调 `control.setWaiting(cmd.fadeTime, cmd.skippable)` 阻塞剧情；`cmd.noWait` ⇒ handler **不调** `setWaiting`，立即放行下一条命令（允许并行动画）。
- **state 保存粒度**：`fadeTime` 入 state（actor 读作动画时长）；`skippable` / `noWait` 通常只被 handler 消费，除非 actor 显式需要（例：`BackgroundState.skippable` 用于背景过渡期间是否可跳过）。
- **默认值约定**（按现有命令对齐）：
  - 视觉类（`bg` / `bgTint`）：`noWait: false`，默认等待过渡完成。
  - 音频类（`bgm` / `sfx` / `sound` 及其 stop 变体）：`noWait: true`，fire-and-forget。
  - 立绘类（`charEnter` / `charAction` / `charLeave` / `charClear`）：`noWait: true`。

### 新增一个 actor

Actor 渲染于 `<StageContextProvider>` 内部，共享 stage context。

**可视 actor**：

```typescript
export function MyActor() {
  const state = useSnapshot(gameState.myField);
  const skipping = useIsSkipping();

  // Finish any in-flight animation instantly when skip activates
  useSkipCallback(() => { /* ... */ });

  // Consume user click before scenario advances; return true if handled
  useInterruptCallback(() => { /* return true when something was consumed */ });

  return <container label="my-actor">...</container>;
}
```

**Headless actor**：

```typescript
export function MyHeadlessActor() {
  const state = useSnapshot(gameState.myField);
  useLayoutEffect(() => {
    executePluginCommand('audio', { subCommand: 'play', /* ... */ });
  }, [state.src]);
  return null;
}
```

**参与自动模式**：长耗时 actor（语音、视频等）用 `useAutoTicket()` 发放 ticket；auto barrier 会等所有 ticket `done()` 后才推进：

```typescript
const issueAutoTicket = useAutoTicket();
const ticket = issueAutoTicket({ label: 'voice:...' });
// 异步完成时 ticket?.done()；提前取消 / 失败时 ticket?.cancel()
```

**阻断 skip / auto**：必须等用户操作的 actor（如选项菜单）用 blocker 而不是 skip callback：

```typescript
const block = useCallback(() => gameState.selection.visible, []);
useSkipBlocker(block);
useAutoBlocker(block);
```

最后把 actor 挂到 `pages/stage.tsx` 的 JSX 树里。

### 新增一个页面 / overlay

1. 在 `pages/` 或 `components/` 下写组件（只用 kit intrinsic element）。
2. 在 `router.ts` 里注册；需要强校验参数时用 descriptor：

   ```typescript
   pages: { mypage: MyPage }
   overlays: {
     myoverlay: { component: MyOverlay, requiredParams: ['x'] },
   }
   ```

3. 导航：

   ```typescript
   navigation.navigate('mypage', { /* ... */ });
   navigation.pushOverlay('myoverlay', { x: 1 });
   ```

### 新增一个可复用组件

放 `components/`，仅使用 kit intrinsic element 与现有 hook（如 `useButton`）：

```typescript
export function MyButton({ label, onClick }: { label: string; onClick: () => void }) {
  const { buttonState, handlers } = useButton({ onClick });
  return (
    <container {...handlers}>
      <text text={label} opacity={buttonState === 'press' ? 0.7 : 1} />
    </container>
  );
}
```

---

## Kit API 速查

以下 API 均从 `@momoyu-ink/kit` 导入。精确字段定义见其 `src/bindings/` 下的 TS 类型。

### JSX 元素

| 元素 | 用途 | 关键 props |
|------|------|-----------|
| `<container>` | 容器 / 布局节点 | 通用变换属性 |
| `<sprite>` | 图片 | `src`, `area`, `mode`, `bounds` |
| `<text>` | 文本 | `text`, `fontSize`, `fillColor`, `printMode`, `printSpeed`, `onFinish`, `onProgress` |
| `<clip>` | 裁剪 | 区域尺寸 |
| `<video>` | 视频 | `src`, `onEnded`, `onStateChange` |
| `<filter>` | 前景滤镜 | filter 类型与参数 |
| `<backdrop>` | 背景滤镜 | filter 类型与参数 |
| `<animation>` | 帧动画 | 动画配置 |

通用属性：`x`, `y`, `anchor`, `pivot`, `scale` / `scaleX` / `scaleY`, `rotation`, `skew` / `skewX` / `skewY`, `visible`, `tint`, `opacity`, `interactive`, `cursor`, `label`，以及 `onClick` / `onMouseDown` / `onKeyDown` / `onTouchStart` 等事件。

节点自定义命令（如 `<text>` 的 `finishPrinting` / `getCursorPosition`）通过 `nodeRef.current?.executeCommand({ subCommand: '...' })` 调用。

### Stage / Scenario hook

| API | 说明 |
|-----|------|
| `createStage()` | 创建 stage（模块级；框架通过 `globalThis` 保活跨 HMR） |
| `StageContextProvider` | 包裹 actor 子树 |
| `useScenario(stories, start, entry, goNextOnLoad?)` | 加载并接管 scenario 生命周期；内部 refcount + 延时 dispose，HMR 瞬时 remount 会复用 live session |
| `nextLine()` / `setWaiting(ms, skippable)` | 普通函数（非 hook），可在事件回调内直接调用 |
| `useSkipCallback(fn)` | 注册 skip 触发时的副作用（典型：瞬时完成当前动画） |
| `useInterruptCallback(fn)` | 注册用户点击 interrupt；返回 `true` 表示已消费，不再推进 |
| `useSkipBlocker(pred)` / `useAutoBlocker(pred)` | 谓词为 true 时阻止 skip / auto 推进 |
| `useAutoTicket()` | 自动模式下发放完成 ticket |
| `useBeforeHandleCommandCallback(fn)` | 每条命令 dispatch 前触发（框架 textbox 用于按需清空） |
| `useIsSkipping()` / `useIsAutoing()` | 响应式读取模式状态 |
| `setDefaultAutoTailMs(ms)` | 设置 auto barrier 默认 tail 时长（settings 里用到） |

### 导航

| API | 说明 |
|-----|------|
| `createStackNavigator({ initialPage, pages, overlays })` | 配置导航器；`pages` / `overlays` 项可直接是组件或 `{ component, requiredParams: [...] }` |
| `createStaticNavigation(navigator)` | 得到 `<Navigation />` 组件 |
| `useNavigation()` / `getNavigator()` | 组件内 / 外获取导航 API |
| `useNavigationParams<T>()` | 读取当前 page / overlay 参数 |
| `useNavigationState()` | 响应式读取导航状态（如 `overlayStack`） |

通过 module augmentation 注册全局类型：

```typescript
declare module '@momoyu-ink/kit' {
  interface RootNavigatorList extends RegisterNavigator<typeof navigator> {}
}
```

### 动画（react-spring 重导出）

**使用原则**：

- **state 驱动用声明式（reactive）**：属性来自 valtio snapshot 或 React state 时，直接把值写进 `useSpring({ ... })`，由 react-spring 在 render 时自动应用。
- **交互 / 时序触发用命令式（factory + ref）**：按钮点击、skip 时立即完成、链式动画等由事件或 effect 主动触发的场景，用 `useSpringRef()` + `useSpring(() => ({ ref, ... }), [])`，在回调里 `ref.start({...})` 或 `ref.set({...})`。`BackgroundActor` 就是典型例子，它在 `useSkipCallback` 里直接用 `transRef.set({ opacity: 1 })` 立刻结束过渡。

⚠️ **避免在同一动画上混用两种模式**：在 state 驱动路径里用 factory + `useEffect` 回写会与 valtio 频繁 re-render 产生时序问题（可能闪烁或漏更新）。选一种模式即可。

**`useTransition` 的语义限制**：它只按 key 跟踪 item 的 enter / leave / update，**不会把已有 item 的 props 变化传播给子组件**。如果 item 在 transition 期间属性会变（如立绘出场后 `charAction` 调整位置），子组件要自己 `useSnapshot()` 读最新状态，而不是依赖 `useTransition((style, item) => ...)` 回调里拿到的 `item`（enter 时捕获的快照）。`CharacterActor` 就是通过 `CharacterSprite` 内部重新查 `characterState.characters` 解决这一问题的。

常用 API：`animated.*`（sprite / container / text / …） / `useSpring` / `useSpringRef` / `useTransition` / `useTrail` / `useChain` / `useFadeIn(time, pauseOnStart?)` / `useFadeOut(time)` / `useFadeInOut(inMs, keepMs, outMs)` / `useSoundEffect(src)` / `easings`。

### 引擎通信

| API | 说明 |
|-----|------|
| `executePluginCommand(plugin, payload)` | 调引擎插件（`audio` / `scenario` / `system` / `gamepad` / …） |
| `executeNodeCommand(nodeId, payload)` | 调节点命令（一般通过 `node.executeCommand(payload)` 间接使用） |
| `addEventListener(name, handler)` | 监听引擎事件，返回 cleanup 函数 |
| `getStageSize()` | 获取舞台尺寸与缩放因子 |

**常用事件名**：`ready` / `beforeunload` / `resize` / `fullscreen` / `gamepad` / `click` / `mousedown` / `mouseup` / `mousemove` / `wheel` / `keydown` / `keyup` / `keypress` / `touchstart` / `touchmove` / `touchend` / `touchcancel`，以及引擎自定义事件。事件字段参见 kit 的 bindings。

---

## 开发规范

### 代码编写准则

- **最小化改动**：实现新功能或修 bug 时，只改必要的部分，不要顺手重构无关代码。
- **从根本上解决问题**：不要打补丁，不要叠床架屋，从根本上分析问题并设计解决方案。
- **不确定就提问**：需要较大重构、需求不明确或存在歧义时，停下来用提问工具向用户确认，不要自行猜测和选择方案。
- **拒绝矛盾需求**：需求之间相互冲突时，拒绝修改并给出详细解释，由用户决定取舍。
- **先读再写**：修改前先阅读相关代码，避免产生重复内容或与既有设计冲突。
- **检查编译错误**：每次实施完成后检查编辑器报错并按需修复。
- **任务分解**：接到多件事情时，先整体 review + 调研，有问题先问，再按顺序实施；实施完再 review 一遍。
- **注释一律英文**：代码文件中的注释必须用英文书写。
- **对话用用户偏好语言**：与用户的自然语言交流使用其偏好语言（默认中文）。

### 框架层架构约束

1. **Handler 负责命令响应与状态落点**：优先表达“命令如何更新框架状态与流程控制”。音频播放、动画启动、节点命令、长生命周期异步执行应放在 actor。当前为 backlog / 存档一致性保留了少量与 scenario 变量同步的桥接逻辑，但不要把更多运行时副作用继续堆进 handler。
2. **Actor 承担所有副作用**：音频播放、引擎命令、动画触发都在 actor。
3. **读 state 必须用 `useSnapshot`**：render 路径中不要直接读 proxy，否则 valtio 无法触发重渲染。
4. **逻辑与 UI 分离**：复杂逻辑进 `hooks/`，UI 保留在 component / actor 里。
5. **优先复用 kit**：动画 helper、事件监听、stage hook、按钮行为等先查 kit，再决定是否自己写。
6. **无单元测试**：类型检查用 `yarn typecheck`（`tsc --noEmit`），编译 / 打包检查用 `yarn build`（rspack）。行为验证通过 `yarn dev` + 引擎运行时观察。

---

## 构建与运行

```bash
yarn                  # 安装依赖
yarn dev              # rspack dev server（开 Fast Refresh；stage 通过 globalThis 保活跨 HMR）
yarn typecheck        # TypeScript 类型检查（tsc --noEmit）
yarn build            # 生产构建 / 打包检查（rspack）
yarn lint / lint:fix  # biome

# 引擎相关（@momoyu-ink/cli）
yarn engine:web       # 浏览器运行
yarn engine:native    # 原生运行
yarn engine:pack      # 打包发布
yarn engine:update    # 更新引擎二进制

# Schema
yarn generate:schema  # 从 Zod 生成 commands.schema.json（含 meta 元数据）
```
