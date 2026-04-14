# Moyu Visual Novel Framework — Agent Guide

This document is for AI coding agents and developers who modify or customize the Moyu Visual Novel Framework. Read it before making any changes.

## What This Project Is

A TypeScript + React framework for building Visual Novel games on the **Moyu** engine (末语). It runs on **native** (Windows/macOS/Linux/Android/iOS via QuickJS) and **web** (WebAssembly) platforms.

- **Renderer**: `@momoyu-ink/kit` custom React reconciler — **NOT react-dom**
- **Elements**: `<container>`, `<sprite>`, `<text>`, `<video>` etc. — **NO HTML elements** (`div`, `span`, etc.)
- **State**: Valtio proxies
- **Animation**: react-spring (re-exported from `@momoyu-ink/kit`)
- **Schema**: Zod for command definitions

## Critical Constraints

1. **No HTML elements.** Every JSX element must be a Moyu intrinsic element from `@momoyu-ink/kit`. If you write `<div>`, it will crash.
2. **No react-dom.** The app uses `createRoot()` from kit, not from `react-dom`.
3. **Use kit APIs first.** Navigation, events, audio, animation, stage management — all provided by `@momoyu-ink/kit`. Do not reinvent them.
4. **Assets are relative paths.** `<sprite src="image.png" />` resolves to `assets/image.png`.

## Project Structure

```
src/
├── index.tsx          # App entry: listens for 'ready' event, creates root, renders <Main>
├── router.ts          # Stack navigator: pages + overlays (type-safe)
├── error.tsx          # Global error boundary fallback
├── actors/            # Stage actors (visual + headless)
│   ├── background.tsx # Background rendering + fade transitions
│   ├── bgm.tsx        # BGM playback (headless)
│   ├── character.tsx  # Character sprites + position/scale animations
│   ├── selection.tsx  # Choice menu rendering
│   ├── sfx.tsx        # Sound effects (headless, skipped during skip mode)
│   ├── sound.tsx      # Named-channel audio (headless)
│   ├── textbox.tsx    # Text box UI + typewriter + buttons
│   └── voice.tsx      # Voice playback + auto-mode tickets (headless)
├── commands/
│   ├── commands.ts    # Zod schemas for all command types
│   └── handlers.ts    # Pure command handlers (state updates only)
├── components/        # Reusable UI components (button, dialog, etc.)
├── hooks/
│   ├── useBacklog.ts  # Backlog history access
│   ├── useButton.ts   # Button interaction logic
│   └── useSaveLoad.ts # Save/load slot management
├── pages/
│   ├── title.tsx      # Title screen / main menu
│   ├── stage.tsx      # Game stage — command dispatch + actor composition
│   ├── menu.tsx       # In-game menu overlay
│   ├── settings.tsx   # Settings overlay
│   ├── saveload.tsx   # Save/load overlay
│   └── backlog.tsx    # Text history overlay
├── state/
│   ├── game.ts        # GameState (valtio proxy) — all game-visible state
│   ├── ui.ts          # UIState — notifications, confirmations, snapshots
│   └── settings.ts    # Persistent settings (auto-saved to engine variables)
└── utils/             # Helpers (state serialization, event merging, etc.)
```

## Architecture Overview

### App Lifecycle

```
Engine fires 'ready' event
  → index.tsx: createRoot().render(<Main>)
    → ErrorBoundary wraps Navigation + Notification
      → router.ts: createStackNavigator defines pages & overlays
        → Title page is the initial page
```

### Navigation Model

- **Pages**: Full-screen stack navigation (`navigate`, `pop`, `clear`)
- **Overlays**: Modal layers with parameters (`pushOverlay`, `popOverlay`)
- Use `useNavigation()` / `getNavigator()` to navigate
- Use `useNavigationParams<T>()` to read page/overlay params
- Register types via `declare module '@momoyu-ink/kit' { interface RegisterNavigator { ... } }`

### Stage & Command Dispatch

The stage is the core gameplay page. It uses a **two-layer** architecture:

**Layer 1 — Command Handlers** (`commands/handlers.ts`): Pure functions that update `gameState`. No side effects.

**Layer 2 — Actors** (`actors/*.tsx`): React components that subscribe to `gameState` via `useSnapshot()` and execute side effects (audio, animation, rendering).

```
Scenario engine fires command event
  → Stage dispatches to registered CommandHandler
    → Handler updates gameState + declares flow control intent
      → Actors re-render and execute side effects
```

Stage is initialized in `pages/stage.tsx`:
```typescript
const stage = createStage(); // module-level singleton

export function Stage() {
  useScenario(stories, story, entry, isNewGame);

  useEffect(() => {
    const unregs = [
      stage.registerCommandSchema(ScenarioCommandSchema),
      stage.registerCommand('text', handleText),
      stage.registerCommand('changebg', handleChangeBg),
      // ... more commands
      stage.registerTextLine(handleTextLine),
    ];
    return () => unregs.forEach(fn => fn());
  }, []);

  return (
    <StageContextProvider stage={stage}>
      <BackgroundActor />
      <CharacterActor />
      <TextBoxActor onButtonClick={handleButtonClick} />
      <BGMActor />
      <VoiceActor />
      {/* ... */}
    </StageContextProvider>
  );
}
```

### Flow Control (GameControl)

Command handlers receive a `GameControl` object:

| Method | Effect |
|--------|--------|
| `control.hold()` | Pause until user click/keyboard |
| `control.setWaiting(ms, skippable)` | Timed wait |
| `control.nextLine()` | Immediately advance |
| `control.unskippable()` | Prevent skip for this point |
| `control.record(meta)` | Record to backlog history |

Default behavior (no call): auto-advance to next line.

### State Management

All game-visible state lives in `gameState` (valtio proxy in `state/game.ts`):

```typescript
gameState.background   // { src, fadeTime, tint, skippable }
gameState.character     // { characters[], presets, currentSpeaker }
gameState.textbox       // { name, text, visible, printMode, ... }
gameState.bgm           // { src, loop, volume, fadeTime }
gameState.voice         // { src, channelName, volume }
gameState.sfx           // { seq, src, loop, volume, ... }
gameState.sound         // { seq, channel, src, loop, volume, ... }
gameState.selection     // { visible, options[], saveTo }
```

- Read state in actors: `const snap = useSnapshot(gameState.background)`
- Write state in handlers: `gameState.textbox.text = 'Hello'`
- Audio actors use `seq`/`stopSeq` increments to trigger change detection

Settings (`state/settings.ts`) are persisted automatically via engine permanent variables.

## How To: Common Customization Tasks

### Add a New Command

1. **Define schema** in `commands/commands.ts`:
```typescript
const MyCommandSchema = z.object({
  command: z.literal('myCommand'),
  param1: z.string(),
  param2: z.number().optional(),
}).describe('Description of what this command does');
```
Add it to the `ScenarioCommandSchema` union.

2. **Write handler** in `commands/handlers.ts`:
```typescript
export const handleMyCommand: CommandHandler<ScenarioCommandSchemaType> = (cmd, control) => {
  if (cmd.command !== 'myCommand') return;
  // Update gameState
  gameState.someField = cmd.param1;
  // Declare flow control
  control.hold(); // or control.setWaiting(ms) or nothing for auto-advance
};
```

3. **Register** in `pages/stage.tsx`:
```typescript
stage.registerCommand('myCommand', handleMyCommand),
```

### Add a New Actor

Actors are React components rendered inside `<StageContextProvider>`.

**Visual actor** (has UI output):
```typescript
export function MyActor() {
  const state = useSnapshot(gameState.myField);
  const skipping = useIsSkipping();

  // Register skip callback to finish animations instantly
  useSkipCallback(() => { /* finish animation */ });

  // Register interrupt callback for user click
  useInterruptCallback(() => { /* finish current action, return true if handled */ });

  return (
    <container label="my-actor">
      <sprite src={state.src} />
    </container>
  );
}
```

**Headless actor** (no UI, only side effects):
```typescript
export function MyHeadlessActor() {
  const state = useSnapshot(gameState.myField);

  useLayoutEffect(() => {
    // Execute engine commands based on state changes
    executePluginCommand('audio', { subCommand: 'play', ... });
  }, [state.src]);

  return null;
}
```

Add the actor to the stage render tree in `pages/stage.tsx`.

### Add a New Page or Overlay

1. Create component in `pages/`:
```typescript
export function MyPage() {
  const navigation = useNavigation();
  return (
    <container label="my-page">
      <sprite src="bg.png" />
    </container>
  );
}
```

2. Register in `router.ts`:
```typescript
// As a page:
pages: { mypage: MyPage, ... }
// Or as an overlay:
overlays: { myoverlay: MyPage, ... }
```

3. Navigate to it:
```typescript
navigation.navigate('mypage', { someParam: 'value' });
navigation.pushOverlay('myoverlay');
```

### Add a New Reusable Component

Place in `components/`. Use kit elements only:
```typescript
export function MyButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { containerProps, textProps, pressing } = useButton({ onPress });
  return (
    <container {...containerProps}>
      <text text={label} {...textProps} opacity={pressing ? 0.7 : 1} />
    </container>
  );
}
```

## Kit API Quick Reference

All imports come from `@momoyu-ink/kit`:

### JSX Elements

| Element | Purpose | Key Props |
|---------|---------|-----------|
| `<container>` | Group/layout node | x, y, anchor, pivot, scale, rotation, visible, opacity, interactive |
| `<sprite>` | Image rendering | src, area, mode, bounds |
| `<text>` | Text rendering | text, fontSize, fillColor, printMode, printSpeed, onFinish |
| `<clip>` | Clipping region | x, y, width, height |
| `<video>` | Video playback | src, onEnded, onStateChange |
| `<filter>` | Visual filters | filter type and params |
| `<backdrop>` | Background filters | filter type and params |

Common attributes on all elements: `x`, `y`, `anchor`, `pivot`, `scale`, `rotation`, `visible`, `tint`, `opacity`, `interactive`, `cursor`, `label`, event handlers (`onClick`, `onMouseDown`, etc.)

### Stage & Scenario Hooks

| API | Usage |
|-----|-------|
| `createStage()` | Create stage singleton (module-level) |
| `StageContextProvider` | Wrap stage actors |
| `useScenario(stories, start, entry, isNew)` | Load and manage scenario lifecycle |
| `nextLine()` | Advance scenario (plain function) |
| `setWaiting(ms, skippable)` | Set timed wait (plain function) |
| `useSkipCallback(fn)` | Register skip handler |
| `useInterruptCallback(fn)` | Register click-interrupt handler |
| `useAutoTicket()` | Issue auto-mode completion ticket |
| `useIsSkipping()` | Check if skip mode is active |
| `useIsAutoing()` | Check if auto mode is active |

### Navigation

| API | Usage |
|-----|-------|
| `createStackNavigator(config)` | Define pages + overlays |
| `createStaticNavigation(navigator)` | Create `<Navigation>` component |
| `useNavigation()` | Get navigator instance in components |
| `getNavigator()` | Get navigator instance outside components |
| `useNavigationParams<T>()` | Read current page/overlay params |

### Animation (react-spring re-exports)

| API | Usage |
|-----|-------|
| `animated.sprite`, `animated.container`, etc. | Animated element primitives |
| `useSpring()` | Single spring animation |
| `useTransition()` | Enter/leave/update transitions |
| `useTrail()` | Staggered animations |
| `useChain()` | Sequenced animation chains |
| `useFadeInOut(in, keep, out)` | Opacity fade helper |
| `useFadeIn(time)` / `useFadeOut(time)` | Simple fade helpers |

### Engine Communication

| API | Usage |
|-----|-------|
| `executePluginCommand(plugin, payload)` | Call engine plugin (audio, scenario, system, etc.) |
| `executeNodeCommand(nodeId, payload)` | Call engine node command |
| `addEventListener(event, callback)` | Listen to engine events, returns cleanup fn |
| `getStageSize()` | Get stage dimensions and scale factor |

### Events

`addEventListener` supports: `ready`, `keydown`, `keyup`, `keypress`, `mousedown`, `mouseup`, `mousemove`, `touchstart`, `touchend`, `touchmove`, `wheel`, `resize`, `fullscreen`, `beforeunload`, `gamepad`, and custom events.

## Development Rules

1. **Minimize changes.** Only modify what is necessary. Do not refactor unrelated code.
2. **Handlers are pure.** Command handlers only update `gameState` — no `executePluginCommand`, no `await`, no side effects.
3. **Actors own side effects.** Audio playback, engine commands, and animations belong in actors.
4. **Separate logic from UI.** Logic goes in hooks, UI stays in components.
5. **Use `useSnapshot()` for reads.** Never read `gameState` directly inside render — always through valtio's `useSnapshot()`.
6. **Use kit before inventing.** Check if `@momoyu-ink/kit` already provides what you need (navigation, animation helpers, event listeners, stage hooks) before writing custom solutions.
7. **English comments in code.** All code comments must be in English.
8. **No unit tests available.** Use `yarn build` to verify TypeScript compilation.

## Build & Run

```bash
yarn           # Install dependencies
yarn build     # Production build (Rspack)
yarn dev       # Dev server

# Engine commands
yarn engine:web     # Run in browser via Moyu engine
yarn engine:native  # Run native via Moyu engine
yarn engine:pack    # Package for distribution

# Schema
yarn generate:schema  # Regenerate command schema from Zod definitions
```
