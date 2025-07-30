# Moyu Visual Novel Framework

> A modern visual novel game development framework built on the Moyu Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

[**中文文档**](README.md)

## 🎮 About Moyu Engine

[**Moyu Engine**](https://momoyu.ink) is a high-performance cross-platform visual novel engine built with Rust core and integrated with QuickJS JavaScript runtime.

### Core Features

- 🚀 **High Performance Rendering** - Rust-driven custom renderer
- 📱 **Cross-Platform Support** - Windows, macOS, Linux, iOS, Android, Web
- 🎨 **Modern UI** - Declarative interface development with React + TypeScript
- 🎵 **Multimedia Support** - Seamless integration of audio, video, and images
- ⚡ **Hot Reload Development** - Fast iteration development experience

## 📦 Framework Overview

This framework is the official Visual Novel template for Moyu Engine, providing a complete visual novel game development solution.

### Tech Stack

- **Rendering Engine**: `@momoyu-ink/kit` custom renderer (not react-dom)
- **UI Framework**: React 18 + TypeScript
- **State Management**: Jotai
- **Animation System**: react-spring (from `@momoyu-ink/kit`)
- **Build Tool**: Rspack
- **Package Manager**: Yarn 4

### Key Constraints

- ❌ No HTML elements support (`div`, `span`, etc.)
- ✅ Only use game elements provided by `@momoyu-ink/kit`
- ✅ Resource paths automatically mapped to `assets/` directory
- ✅ Native integration with Moyu Engine

## 🚀 Quick Start

### Requirements

- Node.js 18+
- Yarn 4.5+
- Moyu Engine runtime

### Install Dependencies

```bash
yarn install
```

### Development Mode

```bash
yarn dev
```

### Build for Production

```bash
yarn build
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── button.tsx      # Button component
│   ├── dialog.tsx      # Dialog component
│   └── ...
├── hooks/              # Custom Hooks
│   ├── useButton.ts    # Button logic
│   ├── useScenario.ts  # Scenario system
│   └── ...
├── pages/              # Game pages
│   ├── title.tsx       # Title screen
│   ├── stage.tsx       # Main game screen
│   ├── settings.tsx    # Settings screen
│   └── saveload.tsx    # Save/Load screen
├── utils/              # Utility functions
├── constants.ts        # Constants definition
├── entry.tsx          # Router entry
└── index.tsx          # Application entry

assets/
├── ui/                 # UI assets
├── audio/              # Audio files
├── fonts/              # Font files
└── scenario/           # Scenario files
```

## 🎨 Core Elements

The framework provides JSX elements optimized specifically for games:

```tsx
// Container element
<container x={100} y={200}>
  {children}
</container>

// Sprite image
<sprite
  src="character.png"
  anchor={[0.5, 1]}
  scale={1.2}
/>

// Text display
<text
  text="Hello, World!"
  printMode="typewriter"
  printSpeed={50}
  fontSize={24}
/>

// Video playback (in development)
<video
  src="opening.mp4"
  autoplay={true}
/>
```

## 🔧 Custom Development

### Adding New Pages

1. Create new page component in `src/pages/`
2. Register route in `src/entry.tsx`
3. Update `GamePage` type definition

### Creating Custom Components

Follow the **Logic Separation** principle:

```tsx
// hooks/useCustomButton.ts - Business logic
export function useCustomButton() {
  const [pressed, setPressed] = useState(false);
  // ... logic code
  return { pressed, handlePress };
}

// components/CustomButton.tsx - UI rendering
export function CustomButton() {
  const { pressed, handlePress } = useCustomButton();

  return (
    <container onClick={handlePress}>
      <sprite src={pressed ? "button_pressed.png" : "button.png"} />
    </container>
  );
}
```

### Engine Command Integration

```tsx
import { executePluginCommand, addEventListener } from "@momoyu-ink/kit";

// Execute engine commands
const gamepads = executePluginCommand("gamepad", {
  subCommand: "getGamepads",
});

// Listen to engine events
useEffect(() => {
  return addEventListener("gamepadbuttondown", (e) => {
    console.log("gamepadbuttondown", JSON.stringify(e));
  });
}, []);
```

## 📝 Development Guide

### Best Practices

1. **Component Design**: Always separate logic layer from rendering layer
2. **State Management**: Use Jotai for state management to avoid prop drilling
3. **Resource Management**: Place all resources in `assets/` directory
4. **Type Safety**: Fully utilize TypeScript's type checking
5. **Performance Optimization**: Proper use of React.memo and useCallback

### Debugging Tips

- Use browser developer tools to debug logic
- Check rendering state through engine console output
- Analyze component tree with React DevTools

## 🔗 Related Resources

- [Official Website](https://momoyu.ink)
- [Documentation](https://momoyu.ink/start/intro)
- [Community Forum](https://momoyu.ink/more/community)

## 📄 License

This project is open source under the MIT License. See [LICENSE](LICENSE.txt) file for details.

### Asset Licensing

- Font files: Source Han Sans fonts under `assets/fonts/` follow SIL Open Font License
- Example assets: Assets under `assets/non-free/` are for demonstration purposes only, commercial use requires proper authorization
- UI assets: Interface assets under `assets/ui/` are free to use

### Contributing

We welcome Issues and Pull Requests to improve this framework. Before contributing code, please ensure:

- Follow the project's code style guidelines
- Add necessary type annotations and comments
- Do not break existing functionality

## 🤝 Community & Support

- **Issue Tracking**: [GitHub Issues](https://github.com/DeepSpaceMill/framework/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/DeepSpaceMill/framework/discussions)
- **Technical Discussion**: [Join Discussion Group](https://momoyu.ink/more/community/)
