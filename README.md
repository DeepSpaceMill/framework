# 末语视觉小说框架（Moyu Visual Novel Framework）

> 基于末语引擎构建的现代化视觉小说游戏开发框架  
> A modern visual novel game development framework built on the Moyu Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

[**English Documentation**](README_EN.md)

## 🎮 关于末语引擎

[**末语引擎**](https://momoyu.ink) 是一个高性能的跨平台视觉小说引擎，采用 Rust 构建核心，集成 QuickJS JavaScript 运行时。

### 核心特性

- 🚀 **高性能渲染** - Rust 驱动的自定义渲染器
- 📱 **跨平台支持** - Windows、macOS、Linux、iOS、Android、Web
- 🎨 **现代化 UI** - 基于 React + TypeScript 的声明式界面开发
- 🎵 **多媒体支持** - 音频、视频、图像的无缝集成
- ⚡ **热重载开发** - 快速迭代的开发体验

## 📦 框架概述

本框架是末语引擎的官方 Visual Novel 模板，提供了完整的视觉小说游戏开发解决方案。

### 技术栈

- **渲染引擎**: `@momoyu-ink/kit` 自定义渲染器（非 react-dom）
- **UI 框架**: React 18 + TypeScript
- **状态管理**: Valtio
- **动画系统**: react-spring（来自 `@momoyu-ink/kit`）
- **构建工具**: Rspack
- **包管理**: Yarn 4

### 关键约束

- ❌ 不支持 HTML 元素（`div`、`span` 等）
- ✅ 仅使用 `@momoyu-ink/kit` 提供的游戏元素
- ✅ 资源路径自动映射到 `assets/` 目录
- ✅ 与末语引擎原生集成

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Yarn 4.5+
- 末语引擎运行时

### 安装依赖

```bash
yarn install
```

### 开发模式

```bash
yarn dev
```

### 构建发布版本

```bash
yarn build
```

## 🏗️ 项目结构

```
src/
├── components/          # 可复用 UI 组件
│   ├── button.tsx      # 按钮组件
│   ├── dialog.tsx      # 对话框组件
│   └── ...
├── hooks/              # 自定义 Hooks
│   ├── useButton.ts    # 按钮逻辑
│   ├── useScenario.ts  # 剧本系统
│   └── ...
├── pages/              # 游戏页面
│   ├── title.tsx       # 标题界面
│   ├── stage.tsx       # 游戏主界面
│   ├── settings.tsx    # 设置界面
│   └── saveload.tsx    # 存档界面
├── utils/              # 工具函数
├── constants.ts        # 常量定义
├── entry.tsx          # 路由入口
└── index.tsx          # 应用入口

assets/
├── ui/                 # UI 素材
├── audio/              # 音频文件
├── fonts/              # 字体文件
└── scenario/           # 剧本文件
```

## 🎨 核心元素

框架提供了专门为游戏优化的 JSX 元素：

```tsx
// 容器元素
<container x={100} y={200}>
  {children}
</container>

// 精灵图像
<sprite
  src="character.png"
  anchor={[0.5, 1]}
  scale={1.2}
/>

// 文本显示
<text
  text="Hello, World!"
  printMode="typewriter"
  printSpeed={50}
  fontSize={24}
/>

// 视频播放（开发中）
<video
  src="opening.mp4"
  autoplay={true}
/>
```

## 🔧 自定义开发

### 添加新页面

1. 在 `src/pages/` 创建新的页面组件
2. 在 `src/entry.tsx` 中注册路由
3. 更新 `GamePage` 类型定义

### 创建自定义组件

遵循 **逻辑分离** 原则：

```tsx
// hooks/useCustomButton.ts - 业务逻辑
export function useCustomButton() {
  const [pressed, setPressed] = useState(false);
  // ... 逻辑代码
  return { pressed, handlePress };
}

// components/CustomButton.tsx - UI 渲染
export function CustomButton() {
  const { pressed, handlePress } = useCustomButton();

  return (
    <container onClick={handlePress}>
      <sprite src={pressed ? "button_pressed.png" : "button.png"} />
    </container>
  );
}
```

### 引擎命令集成

```tsx
import { executePluginCommand, addEventListener } from "@momoyu-ink/kit";

// 执行引擎命令
const gamepads = executePluginCommand("gamepad", {
  subCommand: "getGamepads",
});

// 监听引擎事件
useEffect(() => {
  return addEventListener("gamepadbuttondown", (e) => {
    console.log("gamepadbuttondown", JSON.stringify(e));
  });
}, []);
```

## 📝 开发指南

### 最佳实践

1. **组件设计**: 始终分离逻辑层和渲染层
2. **状态管理**: 使用 Valtio 进行状态管理，避免 prop drilling
3. **资源管理**: 所有资源放在 `assets/` 目录下
4. **类型安全**: 充分利用 TypeScript 的类型检查
5. **性能优化**: 合理使用 React.memo 和 useCallback

### 调试技巧

- 使用浏览器开发者工具调试逻辑
- 通过引擎控制台输出查看渲染状态
- 利用 React DevTools 分析组件树

## 🔗 相关资源

- [官网](https://momoyu.ink)
- [文档](https://momoyu.ink/start/intro)
- [社区论坛](https://momoyu.ink/more/community)

## 📄 版权信息

本项目采用 MIT 许可证开源，详见 [LICENSE](LICENSE.txt) 文件。

### 素材版权

- 字体文件：`assets/fonts/` 下的 Source Han Sans 字体遵循 SIL Open Font License
- 示例素材：`assets/non-free/` 下的素材仅供演示用途，商业使用需获得相应授权
- UI 素材：`assets/ui/` 下的界面素材可自由使用

### 贡献

欢迎提交 Issue 和 Pull Request 来改进本框架。在贡献代码前，请确保：

- 遵循项目的代码风格规范
- 添加必要的类型注解和注释
- 不破坏现有功能

## 🤝 社区与支持

- **Issue 追踪**: [GitHub Issues](https://github.com/DeepSpaceMill/framework/issues)
- **功能请求**: [GitHub Discussions](https://github.com/DeepSpaceMill/framework/discussions)
- **技术交流**: [加入讨论组](https://momoyu.ink/more/community/)
