# Moyu Visual Novel Framework

> The official starter framework for Moyu Engine. This repository already includes a title screen, stage UI, save/load screens, settings, a sample scenario, and sample assets. Follow this README once, get the sample running, then move to the docs site for the rest.

[中文](README.md) · [Quick start](https://momoyu.ink/start/quick-start) · [Documentation](https://momoyu.ink/start/intro) · [Screenshots and preview](https://github.com/DeepSpaceMill/framework/issues/1)

## What this repo gives you

- A visual novel project you can run right away
- Built with React + TypeScript, and runs on [Moyu Engine](https://momoyu.ink/)
- Sample script files, default UI, and built-in command implementations you can reuse or replace

## Quick start

### 1. Get the project

If you already cloned this repository, skip to the next step.

```bash
git clone https://github.com/DeepSpaceMill/framework.git my-vn-project
cd my-vn-project
```

You can also download the repository as a ZIP file if you do not want to use Git.

### 2. Prepare Node.js and Yarn

- Node.js `22.20` or newer is required
- This project uses Yarn 4. On a fresh machine, enable Corepack first:

```bash
corepack enable
yarn
```

### 3. Download the engine

```bash
yarn engine:update
```

This downloads the engine files into the project. The first run needs an internet connection and may take a bit longer.

### 4. Start the dev server

Open one terminal and run:

```bash
yarn dev
```

### 5. Open a preview

Open a second terminal. You can preview with the native runtime or in the browser.

Native preview:

```bash
yarn engine:native
```

Browser preview:

```bash
yarn engine:web
```

Both modes support hot reload. After you change code or script files, the preview refreshes without restarting the app.

### 6. Make the first change

Open `src/pages/title.tsx`, change `'Start Game'` to `'Start Adventure'`, save the file, and look back at the preview. The button text on the title screen should change right away.

If you only want to confirm the workflow, this is the quickest check. Once the button text changes, the dev environment is working.

## Common files

| File | What it is for |
| --- | --- |
| `assets/scenario/start.sixu` | Scenario entry |
| `src/pages/title.tsx` | Title screen and main menu |
| `src/pages/stage.tsx` | Stage composition |
| `src/commands/commands.ts` | Built-in command schema |

## Common commands

| Command | Description |
| --- | --- |
| `yarn dev` | Start the Rspack dev server |
| `yarn engine:native` | Preview with the native engine |
| `yarn engine:web` | Preview in a browser |
| `yarn build` | Build the project |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn generate:schema` | Regenerate `commands.schema.json` |
| `yarn engine:pack` | Package the project |

## Where to go next

This README is meant to get you to a running project fast. After that, the docs site is the better place to keep going:

- [Introduction](https://momoyu.ink/start/intro)
- [Quick start](https://momoyu.ink/start/quick-start)
- [Assets and scripts](https://momoyu.ink/start/assets)
- [Command list](https://momoyu.ink/start/commands)

## License

MIT. See [LICENSE](LICENSE.txt) for details.

- Source Han Sans fonts under `assets/fonts/` follow the SIL Open Font License
- Assets under `assets/non-free/` are for demonstration only. Replace them with assets you are allowed to ship before publishing your own project
