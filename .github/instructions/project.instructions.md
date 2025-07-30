---
applyTo: "**"
---

# Domain knowledge

This project is using TypeScript and React, but not a normal frontend project. It will be running in a game engine named Moyu (末语 in Chinese), which is a game engine that written in Rust and uses quickjs to support JavaScript. We do not use react-dom, but use a custom renderer from `@momoyu-ink/kit`, and many other utils in it as well. We do not use normal dom elements, we have our own IntrinsicElements defined in `@momoyu-ink/kit`, so you should not use normal HTML elements like `div`, `span`, etc. Instead, you should use the elements defined in `@momoyu-ink/kit`, such as `sprite`, `text`, `container`, etc. You can find the full list of elements in the [@momoyu-ink/kit](../../node_modules/@momoyu-ink/kit/dist/declaration.d.ts) package. You should only use elements defined in `@momoyu-ink/kit`.

This project is a _framework_ or _template_ for building games in Moyu, so it should be easy to use and extend. It should provide a good starting point for building games, with a focus on simplicity and ease of use. The project should be well-documented and easy to understand, with clear examples and explanations of how to use the components and utilities provided.

And the components, hooks, and utilities will finally be move to the `@momoyu-ink/kit` package, once they are stable and well-tested. So the code should be written in a way that is easy to move to the `@momoyu-ink/kit` package, with clear separation of concerns and good organization. However, at the moment, you can treat `components/` as a UI library, `hooks/` as a hook library, and `utils/` as a utility library.

When implementing a new component, you will always prefer to separate the logic and the UI. The logic should be implemented in a custom hook, and the UI should be implemented in a functional component that uses the custom hook. You can see the existing components and hooks for examples of how to do this.

The `executePluginCommand` and `executeNodeCommand` functions are used to execute commands in the game engine. However, you cannot get command definition for now, you should guess it or ask me before using it.

When you want to listen to events, you should use the `addEventListener` function from `@momoyu-ink/kit`. Most of times, it has the same API as the native `addEventListener`, but it returns a function to remove the event listener, so you should always call it and store the returned function in a variable, then call it in the `useEffect` cleanup function. It lacks the definition for the same reason above for now.

You can implement animations using `react-spring` but must using the version exported from `@momoyu-ink/kit`. Anything should be the same as the normal one;

All assets (images, sounds, etc.) are stored in the `assets/` folder. You can refer it in code such as `<sprite src="image.png" />` which means the `assets/image.png` file.

We use `jotai` for state management, and usually sync the state with the game engine using `executePluginCommand` or `executeNodeCommand`. You can see the existing code for examples of how to do this.

# Details on our engine

Our engine is made for **Visual Novel** games. A Visual Novel game is usually consisting of a title screen, a main game screen, and a settings screen, and maybe a gallery screen, etc. This screen are implemented as pages in the `pages/` folder, and the most important one is the main game screen in `pages/stage.tsx`.

# Coding standards

- Use TypeScript and React.
- Use `@momoyu-ink/kit` for rendering and utilities.
- Use the elements defined in `@momoyu-ink/kit`, not normal HTML elements, especially text nodes.
- Use functional components and hooks.
- Use `useState`, `useEffect`, and other React hooks as needed.
- Beautiful comments and documentation in English.

# Folder structure

- `src/`: The source code of the project.
  - `components/`: Reusable components.
  - `hooks/`: Custom hooks.
  - `utils/`: Utility functions.
  - `pages/`: Page components.
  - `constants.ts`: Storage for constants used across the application.
  - `error.tsx`: A component to display error messages.
  - `entry.tsx`: A simple router that renders the page components based on the state.
  - `index.tsx`: The main point of the application.
