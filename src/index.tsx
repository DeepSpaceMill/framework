import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { addEventListener, createRoot, KeyboardEvent } from '@momoyu-ink/kit';

import { Entry } from './entry';
import { ErrorFallback } from './error';
import { executePluginCommand } from '@momoyu-ink/kit/dist/moyu';

// import doufu from '../moyu/moyu_lib.js';
// import * as moyu from '../moyu/moyu_lib.js';

function Main() {
  const logError = (error: Error, info: React.ErrorInfo) => {
    console.error('react error:', error);
    console.error(info.componentStack);
  };

  useEffect(() => {
    return addEventListener('keydown', (_: KeyboardEvent) => {
      try {
        const gamepads = executePluginCommand('gamepad', {
          subCommand: 'getGamepads',
        });

        const gamepad = gamepads.find((g?: Gamepad) => g !== null);

        if (gamepad) {
          executePluginCommand('gamepad', {
            subCommand: 'playEffect',
            index: gamepad.index,
            effect: 'dual-rumble',
            params: {
              startDelay: 0,
              duration: 200,
              weakMagnitude: 1.0,
              strongMagnitude: 1.0,
            },
          });
        }
      } catch (e) {
        console.error(e);
      }
    });
  }, []);

  useEffect(() => {
    return addEventListener('gamepadbuttondown', (e) => {
      console.log('gamepadbuttondown', JSON.stringify(e));
    });
  }, []);

  // useEffect(() => {
  //   return addEventListener('gamepadbuttonup', (e) => {
  //     console.log('gamepadbuttonup', JSON.stringify(e));
  //   });
  // }, []);

  // useEffect(() => {
  //   return addEventListener('gamepadbuttonchanged', (e) => {
  //     console.log('gamepadbuttonchanged', JSON.stringify(e));
  //   });
  // }, []);

  useEffect(() => {
    return addEventListener('gamepadaxischanged', (e) => {
      console.log('gamepadaxischanged', JSON.stringify(e));
    });
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      <Entry />
    </ErrorBoundary>
  );
}

const root = createRoot();
root.render(<Main />);

// document.addEventListener('doufu-ready', () => {
//   const root = createRoot();
//   root.render(<Main />);
// });

// document.addEventListener('DOMContentLoaded', async () => {
//   await doufu();
//   window.moyu = {
//     pushCommand(name: string, args: any[]) {
//       return moyu[name](...args);
//     },
//     executeNodeCommand(...args: any[]) {
//       return moyu.execute_node_command(...args);
//     },
//     executePluginCommand(...args: any[]) {
//       return moyu.execute_plugin_command(...args);
//     },
//   };
//   await moyu.doufu_init('root');
// });
