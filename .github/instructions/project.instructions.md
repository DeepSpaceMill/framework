---
applyTo: "**"
---

# Moyu Visual Novel Framework

This is a TypeScript + React framework for building Visual Novel games in the **Moyu** game engine (末语). It will run on both native and web (WebAssembly) platforms.

## Core Technologies

- **Engine**: Moyu (Rust-based with QuickJS JavaScript runtime)
- **Renderer**: Custom renderer from `@momoyu-ink/kit` (NOT react-dom)
- **Elements**: Custom JSX elements (`container`, `sprite`, `text`) - NO HTML elements
- **State**: Valtio for state management
- **Animation**: react-spring (from `@momoyu-ink/kit`)

## Key Constraints

- ❌ No HTML elements (`div`, `span`, etc.)
- ✅ Only use `@momoyu-ink/kit` elements (see [declaration.d.ts](../../node_modules/@momoyu-ink/kit/dist/declaration.d.ts))
- ✅ Assets reference: `<sprite src="image.png" />` → `assets/image.png`
- ✅ Future migration to `@momoyu-ink/kit` package

## Element Reference

You can find all available elements and their properties in the [@momoyu-ink/kit declaration file](../../node_modules/@momoyu-ink/kit/dist/declaration.d.ts). Key elements include:

- `container` - Basic container element
- `sprite` - Image/texture element with nine-slice support
- `text` - Text element with typewriter effects
- `video` - Video playback element

## Architecture & Design Patterns

**Component Structure**: Always separate logic from UI

- Logic → Custom hooks (e.g., `useButton`, `useSaveLoad`)
- UI → Functional components using the hooks

**Engine Integration**:

- `executePluginCommand` / `executeNodeCommand` - Execute engine commands
- `addEventListener` (from `@momoyu-ink/kit`) - Listen to events, returns cleanup function
- State sync with engine via valtio + execute commands
- Note: Command and event definitions are not available yet, will be provided later

**Coding Note**

- Do minimized changes to existing code when implementing new features or fixing bugs.
- Stop and ask for confirmation when a large refactoring is needed or there's something unclear or ambiguous.
- Be wise about performance implications when making changes.
- Decline changes and provide detailed explanations when requirements are contradictory.
- Read the codebase before making changes to avoid creating duplicate content.

**Assets**: All resources in `assets/` folder

```tsx
<sprite src="image.png" /> // → assets/image.png
```

**Animation**: Use react-spring from `@momoyu-ink/kit` (same API as standard react-spring)

# Visual Novel Game Structure

Visual Novel games consist of multiple screens implemented as pages in `pages/`:

- **Title Screen** - Main menu and game entry point
- **Game Stage** (`pages/stage.tsx`) - Core gameplay with dialogue, characters, etc.
- **Settings** - Game configuration and preferences
- **Save&Load** - Save/load functionality
- **Gallery** - Character/scene gallery, or music player

## Stage Command Dispatch Architecture

The game stage uses a **command dispatch system** to process scenario engine events:

- **`src/hooks/useStage.tsx`** — `createStage()` creates a module-level singleton with registries for command handlers, text line handlers, skip callbacks, and interrupt callbacks. `StageContextProvider` binds engine events within React lifecycle.
- **`src/commands/handlers.ts`** — Individual handler functions for each command type (e.g., `handleChangeBg`, `handleAddChar`, `handleSound`). Each handler receives a `GameControl` object to declare flow control intent (`setWaiting`, `hold`, or auto-advance by default).
- **`src/hooks/useScenario.ts`** — `nextLine()` and `setWaiting()` are plain exported functions (not hook return values). `useScenario()` only manages scenario lifecycle (load, start, terminate).

**Key patterns**:

- **Adding a new command**: Add Zod schema in `commands/commands.ts` → add handler in `commands/handlers.ts` → register in `stage.tsx`
- **Skip/Interrupt callbacks**: Actors register capabilities via `useSkipCallback(cb)` (for `scenariowaitingcancelled`) and `useInterruptCallback(cb)` (for user click interruption) — no `forwardRef` needed, stage doesn't need to know about specific actors.

# Development Standards

- **Language**: TypeScript + React functional components
- **Rendering**: `@momoyu-ink/kit` elements only (no HTML elements)
- **State**: Valtio for state management
- **Hooks**: React built-in hooks (`useState`, `useEffect`, etc.) and custom hooks
- **Comments**: Clear English documentation

# Folder structure

- `assets/`: Contains all the static assets (images, sounds, etc.).
- `src/`: The source code of the project.
  - `actors/`: Contains all the actors (backgrounds, characters, dialogues, effects, and so on).
  - `commands/`: Command schema definitions (Zod) and handler functions for scenario commands.
  - `components/`: Reusable components.
  - `hooks/`: Custom hooks (scenario lifecycle, stage dispatch, save/load, etc.).
  - `utils/`: Utility functions.
  - `state/`: State management including game state and ui state.
  - `pages/`: Page components.
  - `error.tsx`: A component to display error messages.
  - `router.ts`: The router that renders the page components and overlays based on the state.
  - `index.tsx`: The main entry point of the application.
