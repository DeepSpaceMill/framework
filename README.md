# 末语视觉小说框架

末语引擎的官方视觉小说开发框架。文档请参阅 [momoyu.ink/start/intro](https://momoyu.ink/start/intro)。

[English](README_EN.md)

## 环境要求

- Node.js 22+

## 安装依赖

```bash
npm install
```

## 安装和更新引擎

```bash
npm run engine:update
```

## 开发

首先启动开发服务器：

```bash
npm run dev
```

然后在另一个终端启动引擎进行预览。使用本地程序：

```bash
npm run engine:native
```

或在浏览器中预览：

```bash
npm run engine:web
```

两种方式均支持热更新。

## 构建

```bash
npm run build
```

## 版权信息

本项目采用 MIT 许可证开源，详见 [LICENSE](LICENSE.txt) 文件。

- 字体文件：`assets/fonts/` 下的 Source Han Sans 字体遵循 SIL Open Font License
- 示例素材：`assets/non-free/` 下的素材仅供演示用途，商业使用需获得相应授权
