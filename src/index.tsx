import {
  addEventListener,
  createRoot,
  executePluginCommand,
  initUiData,
  registerAppStateAdapter,
  startRuntimeDebugSession,
  stopRuntimeDebugSession,
} from '@momoyu-ink/kit';
import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './error';
import { Navigation } from './router';
import { uiActions } from './state/ui';
import { Notification } from './components/notification';
import { gameStateDebugAdapter } from './debug/gameStateAdapter';
import { GameUiSchema } from './data/ui';

registerAppStateAdapter(gameStateDebugAdapter);

function Main() {
  const logError = (error: unknown, info: React.ErrorInfo) => {
    console.error('react error:', error);
    console.error(info.componentStack);
  };

  useEffect(() => {
    return addEventListener('beforeunload', () => {
      uiActions.confirm('确定要退出游戏吗？', () => {
        executePluginCommand('system', {
          subCommand: 'quit',
        });
      });
    });
  }, []);

  useEffect(() => {
    void startRuntimeDebugSession();

    return () => {
      void stopRuntimeDebugSession();
    };
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      <Navigation />
      <Notification />
    </ErrorBoundary>
  );
}

addEventListener('ready', () => {
  void initUiData(GameUiSchema)
    .then(() => {
      const root = createRoot();
      root.render(<Main />);
    })
    .catch((err) => {
      console.error('Failed to initialize UI data:', err);
    });
});
