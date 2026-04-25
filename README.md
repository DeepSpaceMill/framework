# 末语视觉小说框架

> 末语引擎的官方标准框架。仓库里已包含标题界面、舞台、存读档、设置、示例剧本和示例素材。你可以遵照下方提示快速体验，然后遵循文档站的指引改成自己的项目。

[English](README_EN.md) · [快速开始文档](https://momoyu.ink/start/quick-start) · [官方文档站](https://momoyu.ink/start/intro) · [界面截图和预览](https://github.com/DeepSpaceMill/framework/issues/1)

## 这是什么

- 一套可直接运行的视觉小说项目模板
- 基于 React + TypeScript 编写，运行在[末语引擎](https://momoyu.ink/)上
- 自带示例剧本、默认 UI 和常用命令实现，适合直接改成自己的项目

## 5 分钟跑起来

### 1. 获取项目

如果你已经把这个仓库克隆到本地，可以直接跳到下一步。

```bash
git clone https://github.com/DeepSpaceMill/framework.git my-vn-project
cd my-vn-project
```

不想用 Git 也可以，直接从 GitHub 下载 ZIP 并解压。

### 2. 准备 Node.js 和 Yarn

- Node.js 需要 `22.20` 或更高版本
- 这个项目使用 Yarn 4。第一次在新机器上运行时，先启用 Corepack：

```bash
corepack enable
yarn
```

### 3. 下载引擎

```bash
yarn engine:update
```

这一步会从远端下载引擎文件。第一次执行会慢一些，需要联网。

### 4. 启动开发服务器

先开一个终端：

```bash
yarn dev
```

### 5. 打开预览

再开一个新终端。你可以选本地引擎，也可以直接走浏览器。

本地预览：

```bash
yarn engine:native
```

浏览器预览：

```bash
yarn engine:web
```

两种方式都支持热更新。改代码或剧本后，无须重启程序，预览会自动刷新。

### 6. 做第一次修改

项目跑起来以后，先打开 `src/pages/title.tsx`。把`'开始游戏'改成 `'开始冒险'`，保存。预览界面标题界面上的按钮文本应该也变了。

如果你只是想确认工作流通了，这一步最直接。看到文本变了，说明开发环境已经正常。

## 常用文件

| 文件 | 用途 |
| --- | --- |
| `assets/scenario/start.sixu` | 剧本入口 |
| `src/pages/title.tsx` | 标题界面和主菜单 |
| `src/pages/stage.tsx` | 游戏舞台装配 |
| `src/commands/commands.ts` | 框架内置命令 schema |

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `yarn dev` | 启动 Rspack 开发服务器 |
| `yarn engine:native` | 用本地引擎预览 |
| `yarn engine:web` | 用浏览器预览 |
| `yarn build` | 构建项目 |
| `yarn typecheck` | 执行 TypeScript 类型检查 |
| `yarn generate:schema` | 重新生成 `commands.schema.json` |
| `yarn engine:pack` | 打包发布 |

## 跑起来之后看哪里

README 的目标很简单，就是让你先把项目启动起来。接下来建议直接去文档站：

- [介绍](https://momoyu.ink/start/intro)：先了解框架和引擎在做什么
- [快速开始](https://momoyu.ink/start/quick-start)：按文档再走一遍完整流程
- [素材和剧本](https://momoyu.ink/start/assets)：看素材放哪里、Sixu 剧本怎么写
- [命令列表](https://momoyu.ink/start/commands)：查框架内置命令和参数

## 版权信息

本项目采用 MIT 许可证开源，详见 [LICENSE](LICENSE.txt)。

- `assets/fonts/` 下的 Source Han Sans 字体遵循 SIL Open Font License
- `assets/non-free/` 下的示例素材只用于演示。准备发布自己的项目时，请替换成你有授权的资源
